import * as fs from 'fs';
import Model from '../../Model';
import { RecordedDBInterface } from '../../DB/RecordedDB';
import { EncodedDBInterface } from '../../DB/EncodedDB';
import { RecordingManageModelInterface } from '../Recording/RecordingManageModel';
import FileUtil from '../../../Util/FileUtil';

interface RecordedManageModelInterface extends Model {
    delete(id: number): Promise<void>;
    deleteRule(id: number): Promise<void>;
    addThumbnail(id: number, thumbnailPath: string): Promise<void>;
    addEncodeFile(recordedId: number, name: string, filePath: string, delTs: boolean): Promise<number>;
}

class RecordedManageModel extends Model implements RecordedManageModelInterface {
    private recordedDB: RecordedDBInterface;
    private encodedDB: EncodedDBInterface;
    private recordingManage: RecordingManageModelInterface;

    constructor(
        recordedDB: RecordedDBInterface,
        encodedDB: EncodedDBInterface,
        recordingManage: RecordingManageModelInterface,
    ) {
        super();

        this.recordedDB = recordedDB;
        this.encodedDB = encodedDB;
        this.recordingManage = recordingManage;
    }

    /**
    * id で指定した録画を削除
    * @param id: recorded id
    * @throws RecordingManageModelNotFoundRecordedProgram id で指定したプログラムが存在しない場合
    * @return Promise<void>
    */
    public async delete(id: number): Promise<void> {
        this.log.system.info(`delete recorded file ${ id }`);

        // id で指定された recorded を取得
        let recorded = await this.recordedDB.findId(id);
        if(recorded === null) {
            // id で指定された recorded がなかった
            throw new Error('RecordingManageModelNotFoundRecordedProgram');
        }

        //エンコードデータを取得
        let encoded = await this.encodedDB.findRecordedId(id)

        //エンコードデータを DB 上から削除
        await this.encodedDB.deleteRecordedId(id);
        //録画データを DB 上から削除
        await this.recordedDB.delete(id);

        if(recorded.recording) {
            //録画中なら録画停止
            this.recordingManage.stop(recorded.programId);
        }

        if(recorded.recPath !== null) {
            //録画実データを削除
            fs.unlink(recorded.recPath, (err) => {
            if(err) {
                    this.log.system.error(`delete recorded error: ${ id }`);
                    this.log.system.error(String(err));
                }
            });
        }

        //エンコード実データを削除
        encoded.forEach((file) => {
            fs.unlink(file.path, (err) => {
                if(err) {
                    this.log.system.error(`delete encode file error: ${ file.path }`);
                    this.log.system.error(String(err));
                }
            });
        });

        //サムネイルを削除
        if(recorded.thumbnailPath !== null) {
            fs.unlink(recorded.thumbnailPath, (err) => {
                if(err) {
                    this.log.system.error(`recorded failed to delete thumbnail ${ id }`);
                    this.log.system.error(String(err));
                }
            });
        }
    }


    /**
    * id で指定した ruleId をもつ recorded 内のプログラムの ruleId をすべて削除(nullにする)
    * rule が削除されたときに呼ぶ
    * @param id: rule id
    */
    public deleteRule(id: number): Promise<void> {
        this.log.system.info(`delete recorded program ruleId ${ id }`);
        return this.recordedDB.deleteRuleId(id);
    }

    /**
    * サムネイルのパスを追加する
    * @param id: recorded id
    * @param thumbnailPath: thumbnail file path
    * @return Promise<void>
    */
    public addThumbnail(id: number, thumbnailPath: string): Promise<void> {
        this.log.system.info(`add thumbnail: ${ id }`);
        return this.recordedDB.addThumbnail(id, thumbnailPath);
    }

    /**
    * エンコードしたファイルのパスを追加する
    * @param id: recorded id
    * @param filePath: encode file path
    * @return Promise<void>
    */
    public async addEncodeFile(recordedId: number, name: string, filePath: string, delTs: boolean): Promise<number> {
        this.log.system.info(`add encode file: ${ recordedId }`);

        // DB にエンコードファイルを追加
        const encodedId = await this.encodedDB.insert(recordedId, name, filePath, FileUtil.getFileSize(filePath));

        // ts 削除
        if(delTs) {
            let recorded = await this.recordedDB.findId(recordedId);

            //削除するデータがある場合
            if(recorded !== null && recorded.recPath !== null) {
                //削除
                fs.unlink(recorded.recPath, (err) => {
                    this.log.system.info(`delete ts file: ${ recordedId }`);
                    if(err) {
                        this.log.system.error(`delete ts file error: ${ recordedId }`);
                    }
                });

                // DB 上から recPath を削除
                await this.recordedDB.deleteRecPath(recordedId);
            }
        }

        return encodedId;
    }
}

export { RecordedManageModelInterface, RecordedManageModel }

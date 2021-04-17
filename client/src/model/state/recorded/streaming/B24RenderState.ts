import * as b24js from 'b24.js';
import Hls from 'hls-b24.js';
import * as aribb24js from 'aribb24.js';
import { inject, injectable } from 'inversify';
import IB24RenderState from './IB24RenderState';
import { ISettingStorageModel } from '@/model/storage/setting/ISettingStorageModel';

@injectable()
export default class B24RenderState implements IB24RenderState {
    private settingStorageModel: ISettingStorageModel;
    private b24Renderer: aribb24js.CanvasRenderer | b24js.WebVTTRenderer | null = null;

    constructor(@inject('ISettingStorageModel') settingStorageModel: ISettingStorageModel) {
        this.settingStorageModel = settingStorageModel;
    }

    /**
     * set b24 subtitle render
     * @param video: HTMLVideoElement
     * @param hls: Hls
     */
    public init(video: HTMLVideoElement, hls: Hls): void {
        this.destroy();

        const renderType = this.settingStorageModel.getSavedValue().b24RenderType;

        // b24 render を使用する設定ではない場合は何もしない
        if (renderType === 'default') {
            return;
        }

        if (renderType === 'aribb24.js') {
            this.b24Renderer = new aribb24js.CanvasRenderer({});
            this.b24Renderer.attachMedia(video);

            const canvas = this.b24Renderer.getCanvas();
            if (canvas !== null) {
                canvas.style.zIndex = '2';
            }
        } else if (renderType === 'b24.js') {
            this.b24Renderer = new b24js.WebVTTRenderer();
            this.b24Renderer.init().then(() => {
                if (this.b24Renderer) {
                    this.b24Renderer.attachMedia(video);
                }
            });
        }

        if (this.b24Renderer === null) {
            console.error('unknown b24 render type');

            return;
        }

        hls.on(Hls.Events.FRAG_PARSING_PRIVATE_DATA, (_event, data) => {
            if (this.b24Renderer === null) {
                return;
            }

            for (const sample of data.samples) {
                this.b24Renderer.pushData(sample.pid, sample.data, sample.pts);
            }
        });
    }

    /**
     * destory b24 subtitle render
     */
    public destroy(): void {
        if (this.b24Renderer === null) {
            return;
        }

        this.b24Renderer.detachMedia();
        this.b24Renderer.dispose();
        this.b24Renderer = null;
    }

    /**
     * 初期化済みか
     * @return boolean true で初期化済み
     */
    public isInited(): boolean {
        return this.b24Renderer !== null;
    }

    /**
     * 字幕を表示させる
     */
    public showSubtitle(): void {
        if (this.b24Renderer !== null) {
            this.b24Renderer.show();
        }
    }

    /**
     * 字幕を非表示にする
     */
    public disabledSubtitle(): void {
        if (this.b24Renderer !== null) {
            this.b24Renderer.hide();
        }
    }
}

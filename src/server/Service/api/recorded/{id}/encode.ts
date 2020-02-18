import { Operation } from 'express-openapi';
import { RecordedModelInterface } from '../../../../Model/Api/RecordedModel';
import factory from '../../../../Model/ModelFactory';
import * as api from '../../../api';

export const del: Operation = async(req, res) => {
    const recordeds = <RecordedModelInterface> factory.get('RecordedModel');

    try {
        await recordeds.cancelEncode(parseInt(req.params.id, 10));
        api.responseJSON(res, 200, { code: 200 });
        api.notifyClient();
    } catch (err) {
        api.responseServerError(res, err.message);
    }
};

del.apiDoc = {
    summary: 'エンコードをキャンセル',
    tags: ['recorded'],
    description: 'エンコードをキャンセルする',
    parameters: [
        {
            name: 'id',
            in: 'path',
            description: 'recorded id',
            required: true,
            type: 'integer',
            minimum: 1,
        },
    ],
    responses: {
        200: {
            description: 'エンコードをキャンセルしました',
        },
        default: {
            description: '予期しないエラー',
            schema: {
                $ref: '#/definitions/Error',
            },
        },
    },
};

export const post: Operation = async(req, res) => {
    const recordeds = <RecordedModelInterface> factory.get('RecordedModel');

    try {
        await recordeds.addEncode(parseInt(req.params.id, 10), req.body);
        api.responseJSON(res, 200, { code: 200, result: 'ok' });
        api.notifyClient();
    } catch (err) {
        switch (err.message) {
            case RecordedModelInterface.NotFoundRecordedIdError:
                api.responseError(res, { code: 404,  message: 'id is not found' });
                break;
            case RecordedModelInterface.NotFoundRecordedFileError:
                api.responseError(res, { code: 404,  message: 'file is not found' });
                break;
            case RecordedModelInterface.IsRecordingError:
                api.responseError(res, { code: 409,  message: 'file is recording' });
                break;
            default:
                api.responseServerError(res, err.message);
                break;
        }
    }
};

post.apiDoc = {
    summary: 'エンコード手動追加',
    tags: ['recorded'],
    description: 'ンコード手動追加する',
    parameters: [
        {
            name: 'id',
            in: 'path',
            description: 'recorded id',
            required: true,
            type: 'integer',
        },
        {
            name: 'body',
            in: 'body',
            required: true,
            schema: {
                $ref: '#/definitions/RecordedAddEncode',
            },
        },
    ],
    responses: {
        200: {
            description: 'ok',
        },
        404: {
            description: 'Not found',
        },
        409: {
            description: '録画中',
        },
        default: {
            description: '予期しないエラー',
            schema: {
                $ref: '#/definitions/Error',
            },
        },
    },
};


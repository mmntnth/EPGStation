import { Operation } from 'express-openapi';
import { RecordedModelInterface } from '../../../Model/Api/RecordedModel';
import factory from '../../../Model/ModelFactory';
import * as api from '../../api';

export const get: Operation = async(req, res) => {
    const recordeds = <RecordedModelInterface> factory.get('RecordedModel');

    try {
        const result = await recordeds.getId(parseInt(req.params.id, 10));
        api.responseJSON(res, 200, result);
    } catch (err) {
        if (err.message === RecordedModelInterface.NotFoundRecordedIdError) {
            api.responseError(res, { code: 404,  message: 'Recorded Id is not Found' });
        } else {
            api.responseServerError(res, err.message);
        }
    }
};

get.apiDoc = {
    summary: '録画を id 取得',
    tags: ['recorded'],
    description: '録画 を id 取得する',
    parameters: [
        {
            name: 'id',
            in: 'path',
            description: 'recorded id',
            required: true,
            type: 'integer',
        },
    ],
    responses: {
        200: {
            description: '録画 を id 取得しました',
            schema: {
                $ref: '#/definitions/RecordedProgram',
            },
        },
        404: {
            description: '指定された id の 録画データがない',
        },
        default: {
            description: '予期しないエラー',
            schema: {
                $ref: '#/definitions/Error',
            },
        },
    },
};

export const del: Operation = async(req, res) => {
    const recordeds = <RecordedModelInterface> factory.get('RecordedModel');

    try {
        await recordeds.deleteAllRecorded(parseInt(req.params.id, 10));
        api.responseJSON(res, 200, { code: 200 });
        api.notifyClient();
    } catch (err) {
        if (err.message === RecordedModelInterface.RecordedIsStreamingNowError) {
             api.responseError(res, { code: 409,  message: 'is streaming now' });
        } else {
            api.responseServerError(res, err.message);
        }
    }
};

del.apiDoc = {
    summary: '録画を削除',
    tags: ['recorded'],
    description: '録画を削除する',
    parameters: [
        {
            name: 'id',
            in: 'path',
            description: 'recorded id',
            required: true,
            type: 'integer',
        },
    ],
    responses: {
        200: {
            description: '録画を削除しました',
        },
        409: {
            description: '配信中',
        },
        default: {
            description: '予期しないエラー',
            schema: {
                $ref: '#/definitions/Error',
            },
        },
    },
};


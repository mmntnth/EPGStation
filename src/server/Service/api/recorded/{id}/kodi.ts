import { Operation } from 'express-openapi';
import { RecordedModelInterface } from '../../../../Model/Api/RecordedModel';
import factory from '../../../../Model/ModelFactory';
import * as api from '../../../api';

export const post: Operation = async(req, res) => {
    const recordeds = <RecordedModelInterface> factory.get('RecordedModel');

    try {
        await recordeds.sendToKodi(req.headers.host!, req.header('x-forwarded-proto') === 'https', req.body.kodi, parseInt(req.params.id, 10), req.body.encodedId);
        api.responseJSON(res, 200, { code: 200, result: 'ok' });
    } catch (err) {
        if (err.message === RecordedModelInterface.NotFoundRecordedFileError) {
            api.responseError(res, { code: 404,  message: 'Recorded file is not Found' });
        } else {
            api.responseServerError(res, err.message);
        }
    }
};

post.apiDoc = {
    summary: '録画済みファイルを kodi へ送信',
    tags: ['recorded'],
    description: '録画済みファイルを kodi へ送信する',
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
                $ref: '#/definitions/RecordedSendToKodi',
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
        default: {
            description: '予期しないエラー',
            schema: {
                $ref: '#/definitions/Error',
            },
        },
    },
};


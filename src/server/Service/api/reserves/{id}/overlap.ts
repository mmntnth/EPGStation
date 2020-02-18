import { Operation } from 'express-openapi';
import { ReservesModelInterface } from '../../../../Model/Api/ReservesModel';
import factory from '../../../../Model/ModelFactory';
import * as api from '../../../api';

export const del: Operation = async(req, res) => {
    const reserves = <ReservesModelInterface> factory.get('ReservesModel');

    try {
        await reserves.disableReserveOverlap(parseInt(req.params.id, 10));
        api.responseJSON(res, 200, { code: 200 });
    } catch (err) {
        api.responseServerError(res, err.message);
    }
};

del.apiDoc = {
    summary: 'overlap を解除',
    tags: ['reserves'],
    description: 'overlap を解除する',
    parameters: [
        {
            name: 'id',
            in: 'path',
            description: 'program id',
            required: true,
            type: 'integer',
        },
    ],
    responses: {
        200: {
            description: 'overlap を解除しました',
        },
        default: {
            description: '予期しないエラー',
            schema: {
                $ref: '#/definitions/Error',
            },
        },
    },
};


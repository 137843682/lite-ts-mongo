import { DbFactoryBase } from 'lite-ts-db';
import { LoadEnumHandleOption, LoadEnumHandlerBase } from 'lite-ts-enum';

import { Enum } from './i-enum';
import { modelDbOption } from './model-db-option';

export class LoadMongoEnumHandler extends LoadEnumHandlerBase {
    public constructor(
        private m_DbFactory: DbFactoryBase,
    ) {
        super();
    }

    public async handle(opt: LoadEnumHandleOption) {
        const entries = await this.m_DbFactory.db<Enum>(
            modelDbOption(Enum)
        ).query().toArray({
            where: {
                id: opt.enum.name,
            }
        });
        if (!entries.length)
            return;

        opt.res = entries[0].items.reduce((memo, r) => {
            memo[r.value] = r;
            return memo;
        }, {});
    }
}
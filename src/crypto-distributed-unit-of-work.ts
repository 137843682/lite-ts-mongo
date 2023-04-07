import { AnyBulkWriteOperation, ClientSession, ReadPreference } from 'mongodb';

import { CryptoUnitOfWorkBase } from './crypto-unit-of-work-base';

export class CryptoDistributedUnitOfWork extends CryptoUnitOfWorkBase {
    protected async commitWithSession(session: ClientSession, bulks: [string, AnyBulkWriteOperation[]][]) {
        try {
            session.startTransaction({
                readPreference: ReadPreference.primary,
                readConcern: {
                    level: 'local'
                },
                writeConcern: {
                    w: 'majority'
                },
                maxCommitTimeMS: 1000
            });

            const db = await this.pool.db;
            for (const r of bulks) {
                await db.collection(r[0]).bulkWrite(r[1], {
                    ...this.blukWriteOptions,
                    session
                });
            }

            await session.commitTransaction();
        } catch (ex) {
            console.log(ex);

            await session.abortTransaction();
        }
    }
}
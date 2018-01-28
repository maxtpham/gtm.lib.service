import { injectable } from 'inversify';

export interface Service {
}

@injectable()
export abstract class ServiceImpl implements Service {
}

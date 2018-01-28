import { injectable } from 'inversify';
import * as express from "express";

@injectable()
export abstract class Controller {
}

@injectable()
export abstract class ApiController extends Controller {
}

@injectable()
export abstract class WebController extends Controller {
}
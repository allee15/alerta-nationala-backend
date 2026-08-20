import type { Request, Response } from 'express';

import { createApp } from '../src/app';

type Handler = (request: Request, response: Response) => unknown;

let handler: Promise<Handler> | undefined;

export default async function apiHandler(
  request: Request,
  response: Response,
) {
  handler ??= createApp().then((app) => app.getHttpAdapter().getInstance());
  const appHandler = await handler;
  return appHandler(request, response);
}
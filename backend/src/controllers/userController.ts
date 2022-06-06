import { Request, Response } from 'express';
import User from '@models/user';
import IUser from '@interfaces/user';
import HttpError from '@models/errors/HttpError';
import CrudController from './crudController';
import mongoose from '../database';
import Role from '../enums/role';
import { ParamsDictionary } from 'express-serve-static-core';
import { ParsedQs } from 'qs';

require('express-async-errors');

class UserController extends CrudController<IUser, typeof User> {
  override getEntity() {
    return User;
  }

  override populate(entity) {
    return entity;
  }

  override async createFromParameters(request: Request): Promise<IUser> {
    const { email } = request.body;

    if (await User.findOne({ email })) {
      throw new HttpError('Usuário já cadastrado', 409);
    }

    return super.createFromParameters(request);
  }

  override async updateFromParameters(request: Request): Promise<IUser> {
    const user = await User.findById(request.userId);
    // se o usuario tentar alterar a propria role
    if (request.body.role && user.role !== request.body.role && user.role !== Role.ADMIN) {
      throw new HttpError('Forbidden', 403);
    }

    return super.updateFromParameters(request);
  }

  override prepareQuery(request: Request, query: mongoose.FilterQuery<IUser>): void {
    const {name, role} = request.query
    if (name) {
      query.name = {$regex: new RegExp(name as string), $options: "i"}
    }
    if (role) {
      query.role = role
    }
  }
 
}

export default new UserController();

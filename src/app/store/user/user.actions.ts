import { createAction, props } from '@ngrx/store';
import {User} from '../../models/user';


export const loadCurrentUser = createAction('[User] Load Current User');
export const loadCurrentUserSuccess = createAction(
  '[User] Load Current User Success',
  props<{ user: User }>()
);
export const loadCurrentUserFailure = createAction(
  '[User] Load Current User Failure',
  props<{ error: any }>()
);

export const logout = createAction('[User] Logout');
export const logoutSuccess = createAction('[User] Logout Success');
export const logoutFailure = createAction(
  '[User] Logout Failure',
  props<{ error: any }>()
);











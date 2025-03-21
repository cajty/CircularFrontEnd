// Step 2: Define the User state interface
// user.reducer.ts
import { createReducer, on } from '@ngrx/store';
import * as UserActions from './user.actions';
import {User} from '../../models/user';


export interface UserState {
  currentUser: User | null;
  loading: boolean;
  error: any;
}

export const initialUserState: UserState = {
  currentUser: null,
  loading: false,
  error: null
};

export const userReducer = createReducer(
  initialUserState,

  on(UserActions.loadCurrentUser, state => ({
    ...state,
    loading: true,
    error: null
  })),

  on(UserActions.loadCurrentUserSuccess, (state, { user }) => ({
    ...state,
    currentUser: user,
    loading: false
  })),

  on(UserActions.loadCurrentUserFailure, (state, { error }) => ({
    ...state,
    error,
    loading: false
  })),

  on(UserActions.logout, state => ({
    ...state,
    loading: true,
    error: null
  })),

  on(UserActions.logoutSuccess, state => ({
    ...state,
    currentUser: null,
    loading: false
  })),

  on(UserActions.logoutFailure, (state, { error }) => ({
    ...state,
    error,
    loading: false
  })),

  on(UserActions.resetUserState, () => ({
    ...initialUserState,
  }))
);

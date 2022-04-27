import { GraphQLResolveInfo } from 'graphql';
import { IAuthorModel, IBookModel, IContext } from './models';
export type Maybe<T> = T | null;
export type InputMaybe<T> = Maybe<T>;
export type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
export type MakeOptional<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]?: Maybe<T[SubKey]> };
export type MakeMaybe<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]: Maybe<T[SubKey]> };
export type RequireFields<T, K extends keyof T> = Omit<T, K> & { [P in K]-?: NonNullable<T[P]> };
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  ID: string;
  String: string;
  Boolean: boolean;
  Int: number;
  Float: number;
};

/** Input for addBook mutation */
export type TAddBookInput = {
  author: Scalars['String'];
  title: Scalars['String'];
};

/** Ein Author */
export type TAuthor = {
  __typename?: 'Author';
  books: Array<TBook>;
  name: Scalars['String'];
};

/** Ein Buch */
export type TBook = {
  __typename?: 'Book';
  author: TAuthor;
  title: Scalars['String'];
};

/** Mutations */
export type TMutation = {
  __typename?: 'Mutation';
  addBook: TBook;
  login: TSession;
  logout: TSession;
};


/** Mutations */
export type TMutationAddBookArgs = {
  input: TAddBookInput;
};


/** Mutations */
export type TMutationLoginArgs = {
  password: Scalars['String'];
  user: TUserSignatureInput;
};

/** Queries */
export type TQuery = {
  __typename?: 'Query';
  author?: Maybe<TAuthor>;
  authors: Array<TAuthor>;
  book?: Maybe<TBook>;
  books: Array<TBook>;
  session: TSession;
};


/** Queries */
export type TQueryAuthorArgs = {
  name: Scalars['String'];
};


/** Queries */
export type TQueryBookArgs = {
  title: Scalars['String'];
};

/** The current session */
export type TSession = {
  __typename?: 'Session';
  id: Scalars['ID'];
  user?: Maybe<TUserSignature>;
};

/** Subscriptions */
export type TSubscription = {
  __typename?: 'Subscription';
  addedBook: TBook;
};


/** Subscriptions */
export type TSubscriptionAddedBookArgs = {
  author?: InputMaybe<Scalars['String']>;
};

/** Information needed to identify a user */
export type TUserSignature = {
  __typename?: 'UserSignature';
  id: Scalars['String'];
  type: TUserType;
};

/** Information needed to identify a user */
export type TUserSignatureInput = {
  id: Scalars['String'];
  type: TUserType;
};

/** type of user */
export type TUserType =
  | 'citizen'
  | 'company'
  | 'guest';

export type WithIndex<TObject> = TObject & Record<string, any>;
export type ResolversObject<TObject> = WithIndex<TObject>;

export type ResolverTypeWrapper<T> = Promise<T> | T;


export type ResolverWithResolve<TResult, TParent, TContext, TArgs> = {
  resolve: ResolverFn<TResult, TParent, TContext, TArgs>;
};
export type Resolver<TResult, TParent = {}, TContext = {}, TArgs = {}> = ResolverFn<TResult, TParent, TContext, TArgs> | ResolverWithResolve<TResult, TParent, TContext, TArgs>;

export type ResolverFn<TResult, TParent, TContext, TArgs> = (
  parent: TParent,
  args: TArgs,
  context: TContext,
  info: GraphQLResolveInfo
) => Promise<TResult> | TResult;

export type SubscriptionSubscribeFn<TResult, TParent, TContext, TArgs> = (
  parent: TParent,
  args: TArgs,
  context: TContext,
  info: GraphQLResolveInfo
) => AsyncIterable<TResult> | Promise<AsyncIterable<TResult>>;

export type SubscriptionResolveFn<TResult, TParent, TContext, TArgs> = (
  parent: TParent,
  args: TArgs,
  context: TContext,
  info: GraphQLResolveInfo
) => TResult | Promise<TResult>;

export interface SubscriptionSubscriberObject<TResult, TKey extends string, TParent, TContext, TArgs> {
  subscribe: SubscriptionSubscribeFn<{ [key in TKey]: TResult }, TParent, TContext, TArgs>;
  resolve?: SubscriptionResolveFn<TResult, { [key in TKey]: TResult }, TContext, TArgs>;
}

export interface SubscriptionResolverObject<TResult, TParent, TContext, TArgs> {
  subscribe: SubscriptionSubscribeFn<any, TParent, TContext, TArgs>;
  resolve: SubscriptionResolveFn<TResult, any, TContext, TArgs>;
}

export type SubscriptionObject<TResult, TKey extends string, TParent, TContext, TArgs> =
  | SubscriptionSubscriberObject<TResult, TKey, TParent, TContext, TArgs>
  | SubscriptionResolverObject<TResult, TParent, TContext, TArgs>;

export type SubscriptionResolver<TResult, TKey extends string, TParent = {}, TContext = {}, TArgs = {}> =
  | ((...args: any[]) => SubscriptionObject<TResult, TKey, TParent, TContext, TArgs>)
  | SubscriptionObject<TResult, TKey, TParent, TContext, TArgs>;

export type TypeResolveFn<TTypes, TParent = {}, TContext = {}> = (
  parent: TParent,
  context: TContext,
  info: GraphQLResolveInfo
) => Maybe<TTypes> | Promise<Maybe<TTypes>>;

export type IsTypeOfResolverFn<T = {}, TContext = {}> = (obj: T, context: TContext, info: GraphQLResolveInfo) => boolean | Promise<boolean>;

export type NextResolverFn<T> = () => Promise<T>;

export type DirectiveResolverFn<TResult = {}, TParent = {}, TContext = {}, TArgs = {}> = (
  next: NextResolverFn<TResult>,
  parent: TParent,
  args: TArgs,
  context: TContext,
  info: GraphQLResolveInfo
) => TResult | Promise<TResult>;

/** Mapping between all available schema types and the resolvers types */
export type TResolversTypes = ResolversObject<{
  AddBookInput: TAddBookInput;
  Author: ResolverTypeWrapper<IAuthorModel>;
  Book: ResolverTypeWrapper<IBookModel>;
  Boolean: ResolverTypeWrapper<Scalars['Boolean']>;
  ID: ResolverTypeWrapper<Scalars['ID']>;
  Mutation: ResolverTypeWrapper<{}>;
  Query: ResolverTypeWrapper<{}>;
  Session: ResolverTypeWrapper<TSession>;
  String: ResolverTypeWrapper<Scalars['String']>;
  Subscription: ResolverTypeWrapper<{}>;
  UserSignature: ResolverTypeWrapper<TUserSignature>;
  UserSignatureInput: TUserSignatureInput;
  UserType: TUserType;
}>;

/** Mapping between all available schema types and the resolvers parents */
export type TResolversParentTypes = ResolversObject<{
  AddBookInput: TAddBookInput;
  Author: IAuthorModel;
  Book: IBookModel;
  Boolean: Scalars['Boolean'];
  ID: Scalars['ID'];
  Mutation: {};
  Query: {};
  Session: TSession;
  String: Scalars['String'];
  Subscription: {};
  UserSignature: TUserSignature;
  UserSignatureInput: TUserSignatureInput;
}>;

export type TAuthorResolvers<ContextType = IContext, ParentType extends TResolversParentTypes['Author'] = TResolversParentTypes['Author']> = ResolversObject<{
  books?: Resolver<Array<TResolversTypes['Book']>, ParentType, ContextType>;
  name?: Resolver<TResolversTypes['String'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type TBookResolvers<ContextType = IContext, ParentType extends TResolversParentTypes['Book'] = TResolversParentTypes['Book']> = ResolversObject<{
  author?: Resolver<TResolversTypes['Author'], ParentType, ContextType>;
  title?: Resolver<TResolversTypes['String'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type TMutationResolvers<ContextType = IContext, ParentType extends TResolversParentTypes['Mutation'] = TResolversParentTypes['Mutation']> = ResolversObject<{
  addBook?: Resolver<TResolversTypes['Book'], ParentType, ContextType, RequireFields<TMutationAddBookArgs, 'input'>>;
  login?: Resolver<TResolversTypes['Session'], ParentType, ContextType, RequireFields<TMutationLoginArgs, 'password' | 'user'>>;
  logout?: Resolver<TResolversTypes['Session'], ParentType, ContextType>;
}>;

export type TQueryResolvers<ContextType = IContext, ParentType extends TResolversParentTypes['Query'] = TResolversParentTypes['Query']> = ResolversObject<{
  author?: Resolver<Maybe<TResolversTypes['Author']>, ParentType, ContextType, RequireFields<TQueryAuthorArgs, 'name'>>;
  authors?: Resolver<Array<TResolversTypes['Author']>, ParentType, ContextType>;
  book?: Resolver<Maybe<TResolversTypes['Book']>, ParentType, ContextType, RequireFields<TQueryBookArgs, 'title'>>;
  books?: Resolver<Array<TResolversTypes['Book']>, ParentType, ContextType>;
  session?: Resolver<TResolversTypes['Session'], ParentType, ContextType>;
}>;

export type TSessionResolvers<ContextType = IContext, ParentType extends TResolversParentTypes['Session'] = TResolversParentTypes['Session']> = ResolversObject<{
  id?: Resolver<TResolversTypes['ID'], ParentType, ContextType>;
  user?: Resolver<Maybe<TResolversTypes['UserSignature']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type TSubscriptionResolvers<ContextType = IContext, ParentType extends TResolversParentTypes['Subscription'] = TResolversParentTypes['Subscription']> = ResolversObject<{
  addedBook?: SubscriptionResolver<TResolversTypes['Book'], "addedBook", ParentType, ContextType, Partial<TSubscriptionAddedBookArgs>>;
}>;

export type TUserSignatureResolvers<ContextType = IContext, ParentType extends TResolversParentTypes['UserSignature'] = TResolversParentTypes['UserSignature']> = ResolversObject<{
  id?: Resolver<TResolversTypes['String'], ParentType, ContextType>;
  type?: Resolver<TResolversTypes['UserType'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type TResolvers<ContextType = IContext> = ResolversObject<{
  Author?: TAuthorResolvers<ContextType>;
  Book?: TBookResolvers<ContextType>;
  Mutation?: TMutationResolvers<ContextType>;
  Query?: TQueryResolvers<ContextType>;
  Session?: TSessionResolvers<ContextType>;
  Subscription?: TSubscriptionResolvers<ContextType>;
  UserSignature?: TUserSignatureResolvers<ContextType>;
}>;


import { GraphQLResolveInfo } from "graphql";
import { IAuthorModel, IBookModel, IContext } from "./models";
export type Maybe<T> = T | null;
export type Exact<T extends { [key: string]: unknown }> = {
    [K in keyof T]: T[K];
};
export type MakeOptional<T, K extends keyof T> = Omit<T, K> &
    { [SubKey in K]?: Maybe<T[SubKey]> };
export type MakeMaybe<T, K extends keyof T> = Omit<T, K> &
    { [SubKey in K]: Maybe<T[SubKey]> };
export type RequireFields<T, K extends keyof T> = {
    [X in Exclude<keyof T, K>]?: T[X];
} &
    { [P in K]-?: NonNullable<T[P]> };
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
    ID: string;
    String: string;
    Boolean: boolean;
    Int: number;
    Float: number;
};

/**  Ein Buch  */
export type IBook = {
    __typename?: "Book";
    title: Scalars["String"];
    author: IAuthor;
};

/**  Ein Author  */
export type IAuthor = {
    __typename?: "Author";
    name: Scalars["String"];
    books: Array<IBook>;
};

/**  Input for addBook mutation  */
export type IAddBookInput = {
    title: Scalars["String"];
    author: Scalars["String"];
};

export type IAddedBookInput = {
    author?: Maybe<Scalars["String"]>;
};

/**  Queries  */
export type IQuery = {
    __typename?: "Query";
    books: Array<IBook>;
    book?: Maybe<IBook>;
    authors: Array<IAuthor>;
    author?: Maybe<IAuthor>;
};

/**  Queries  */
export type IQueryBookArgs = {
    title: Scalars["String"];
};

/**  Queries  */
export type IQueryAuthorArgs = {
    name: Scalars["String"];
};

/**  Mutations  */
export type IMutation = {
    __typename?: "Mutation";
    addBook: IBook;
};

/**  Mutations  */
export type IMutationAddBookArgs = {
    input: IAddBookInput;
};

/**  Subscriptions  */
export type ISubscription = {
    __typename?: "Subscription";
    addedBook: IBook;
};

/**  Subscriptions  */
export type ISubscriptionAddedBookArgs = {
    input: IAddedBookInput;
};

export type WithIndex<TObject> = TObject & Record<string, any>;
export type ResolversObject<TObject> = WithIndex<TObject>;

export type ResolverTypeWrapper<T> = Promise<T> | T;

export type LegacyStitchingResolver<TResult, TParent, TContext, TArgs> = {
    fragment: string;
    resolve: ResolverFn<TResult, TParent, TContext, TArgs>;
};

export type NewStitchingResolver<TResult, TParent, TContext, TArgs> = {
    selectionSet: string;
    resolve: ResolverFn<TResult, TParent, TContext, TArgs>;
};
export type StitchingResolver<TResult, TParent, TContext, TArgs> =
    | LegacyStitchingResolver<TResult, TParent, TContext, TArgs>
    | NewStitchingResolver<TResult, TParent, TContext, TArgs>;
export type Resolver<TResult, TParent = {}, TContext = {}, TArgs = {}> =
    | ResolverFn<TResult, TParent, TContext, TArgs>
    | StitchingResolver<TResult, TParent, TContext, TArgs>;

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
) => AsyncIterator<TResult> | Promise<AsyncIterator<TResult>>;

export type SubscriptionResolveFn<TResult, TParent, TContext, TArgs> = (
    parent: TParent,
    args: TArgs,
    context: TContext,
    info: GraphQLResolveInfo
) => TResult | Promise<TResult>;

export interface SubscriptionSubscriberObject<
    TResult,
    TKey extends string,
    TParent,
    TContext,
    TArgs
> {
    subscribe: SubscriptionSubscribeFn<
        { [key in TKey]: TResult },
        TParent,
        TContext,
        TArgs
    >;
    resolve?: SubscriptionResolveFn<
        TResult,
        { [key in TKey]: TResult },
        TContext,
        TArgs
    >;
}

export interface SubscriptionResolverObject<TResult, TParent, TContext, TArgs> {
    subscribe: SubscriptionSubscribeFn<any, TParent, TContext, TArgs>;
    resolve: SubscriptionResolveFn<TResult, any, TContext, TArgs>;
}

export type SubscriptionObject<
    TResult,
    TKey extends string,
    TParent,
    TContext,
    TArgs
> = SubscriptionSubscriberObject<TResult, TKey, TParent, TContext, TArgs>;
// | SubscriptionResolverObject<TResult, TParent, TContext, TArgs>;

export type SubscriptionResolver<
    TResult,
    TKey extends string,
    TParent = {},
    TContext = {},
    TArgs = {}
> =
    | ((
          ...args: any[]
      ) => SubscriptionObject<TResult, TKey, TParent, TContext, TArgs>)
    | SubscriptionObject<TResult, TKey, TParent, TContext, TArgs>;

export type TypeResolveFn<TTypes, TParent = {}, TContext = {}> = (
    parent: TParent,
    context: TContext,
    info: GraphQLResolveInfo
) => Maybe<TTypes> | Promise<Maybe<TTypes>>;

export type IsTypeOfResolverFn<T = {}, TContext = {}> = (
    obj: T,
    context: TContext,
    info: GraphQLResolveInfo
) => boolean | Promise<boolean>;

export type NextResolverFn<T> = () => Promise<T>;

export type DirectiveResolverFn<
    TResult = {},
    TParent = {},
    TContext = {},
    TArgs = {}
> = (
    next: NextResolverFn<TResult>,
    parent: TParent,
    args: TArgs,
    context: TContext,
    info: GraphQLResolveInfo
) => TResult | Promise<TResult>;

/** Mapping between all available schema types and the resolvers types */
export type IResolversTypes = ResolversObject<{
    Book: ResolverTypeWrapper<IBookModel>;
    String: ResolverTypeWrapper<Scalars["String"]>;
    Author: ResolverTypeWrapper<IAuthorModel>;
    AddBookInput: IAddBookInput;
    AddedBookInput: IAddedBookInput;
    Query: ResolverTypeWrapper<{}>;
    Mutation: ResolverTypeWrapper<{}>;
    Subscription: ResolverTypeWrapper<{}>;
    Boolean: ResolverTypeWrapper<Scalars["Boolean"]>;
}>;

/** Mapping between all available schema types and the resolvers parents */
export type IResolversParentTypes = ResolversObject<{
    Book: IBookModel;
    String: Scalars["String"];
    Author: IAuthorModel;
    AddBookInput: IAddBookInput;
    AddedBookInput: IAddedBookInput;
    Query: {};
    Mutation: {};
    Subscription: {};
    Boolean: Scalars["Boolean"];
}>;

export type IBookResolvers<
    ContextType = IContext,
    ParentType extends IResolversParentTypes["Book"] = IResolversParentTypes["Book"]
> = ResolversObject<{
    title?: Resolver<IResolversTypes["String"], ParentType, ContextType>;
    author?: Resolver<IResolversTypes["Author"], ParentType, ContextType>;
    __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type IAuthorResolvers<
    ContextType = IContext,
    ParentType extends IResolversParentTypes["Author"] = IResolversParentTypes["Author"]
> = ResolversObject<{
    name?: Resolver<IResolversTypes["String"], ParentType, ContextType>;
    books?: Resolver<Array<IResolversTypes["Book"]>, ParentType, ContextType>;
    __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type IQueryResolvers<
    ContextType = IContext,
    ParentType extends IResolversParentTypes["Query"] = IResolversParentTypes["Query"]
> = ResolversObject<{
    books?: Resolver<Array<IResolversTypes["Book"]>, ParentType, ContextType>;
    book?: Resolver<
        Maybe<IResolversTypes["Book"]>,
        ParentType,
        ContextType,
        RequireFields<IQueryBookArgs, "title">
    >;
    authors?: Resolver<
        Array<IResolversTypes["Author"]>,
        ParentType,
        ContextType
    >;
    author?: Resolver<
        Maybe<IResolversTypes["Author"]>,
        ParentType,
        ContextType,
        RequireFields<IQueryAuthorArgs, "name">
    >;
}>;

export type IMutationResolvers<
    ContextType = IContext,
    ParentType extends IResolversParentTypes["Mutation"] = IResolversParentTypes["Mutation"]
> = ResolversObject<{
    addBook?: Resolver<
        IResolversTypes["Book"],
        ParentType,
        ContextType,
        RequireFields<IMutationAddBookArgs, "input">
    >;
}>;

export type ISubscriptionResolvers<
    ContextType = IContext,
    ParentType extends IResolversParentTypes["Subscription"] = IResolversParentTypes["Subscription"]
> = ResolversObject<{
    addedBook?: SubscriptionResolver<
        IResolversTypes["Book"],
        "addedBook",
        ParentType,
        ContextType,
        RequireFields<ISubscriptionAddedBookArgs, "input">
    >;
}>;

export type IResolvers<ContextType = IContext> = ResolversObject<{
    Book?: IBookResolvers<ContextType>;
    Author?: IAuthorResolvers<ContextType>;
    Query?: IQueryResolvers<ContextType>;
    Mutation?: IMutationResolvers<ContextType>;
    Subscription?: ISubscriptionResolvers<ContextType>;
}>;

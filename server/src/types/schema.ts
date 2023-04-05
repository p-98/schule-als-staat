import { File } from '@whatwg-node/fetch';
import { GraphQLResolveInfo, GraphQLScalarType, GraphQLScalarTypeConfig } from 'graphql';
import { IAuthorModel, IBookModel, ISessionModel, IGuestUserModel, ICitizenUserModel, ICompanyUserModel, ICompanyStatsFragmentModel, IWorktimeModel, IEmploymentModel, IEmploymentOfferModel, ITransferTransactionModel, IChangeTransactionModel, IPurchaseTransactionModel, IPurchaseItemModel, ICustomsTransactionModel, ISalaryTransactionModel, IBorderCrossingModel, IProductModel, IProductStatsFragmentModel, IVoteCitizenEdgeModel, IVoteModel, IContext } from './models';
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
  /**  For RFC 3339 datetime strings, handled by graphql-scalars  */
  DateTime: string;
  /**  For file uploads; automatically handled by graphql-yoga  */
  File: File;
  /**  For void returns, handled by graphql-scalars  */
  Void: void;
};

/**  Input for addBook mutation  */
export type TAddBookInput = {
  author: Scalars['String'];
  title: Scalars['String'];
};

/**  Input for addProduct mutation  */
export type TAddProductInput = {
  name: Scalars['String'];
  price: Scalars['Float'];
};

/**  Roles used for authorization  */
export type TAuthRole =
  | 'ADMIN'
  | 'BANK'
  | 'BORDER_CONTROL'
  | 'CITIZEN'
  | 'COMPANY'
  | 'POLICE'
  | 'POLITICS'
  | 'USER';

/**  Ein Author  */
export type TAuthor = {
  __typename?: 'Author';
  books: Array<TBook>;
  name: Scalars['String'];
};

/**  Ein Buch  */
export type TBook = {
  __typename?: 'Book';
  author: TAuthor;
  title: Scalars['String'];
};

/**  return type for registerBorderCrossing mutation  */
export type TBorderCrossing = {
  __typename?: 'BorderCrossing';
  action: TBorderCrossingAction;
  citizen: TCitizenUser;
  date: Scalars['DateTime'];
};

/**  action of BorderCrossing  */
export type TBorderCrossingAction =
  | 'ENTER'
  | 'LEAVE';

/**  A change transaction  */
export type TChangeTransaction = TTransaction & {
  __typename?: 'ChangeTransaction';
  action: TChangeTransactionAction;
  date: Scalars['DateTime'];
  id: Scalars['ID'];
  user: TUser;
  valueReal: Scalars['Float'];
  valueVirtual: Scalars['Float'];
};

/**  change action types  */
export type TChangeTransactionAction =
  | 'REAL_TO_VIRTUAL'
  | 'VIRTUAL_TO_REAL';

/**  Input for changeCurrencies mutation  */
export type TChangeTransactionInput = {
  action: TChangeTransactionAction;
  user: TUserSignatureInput;
  valueReal: Scalars['Float'];
  valueVirtual: Scalars['Float'];
};

/**  A citizen user  */
export type TCitizenUser = TUser & {
  __typename?: 'CitizenUser';
  balance: Scalars['Float'];
  employment?: Maybe<TEmployment>;
  firstName: Scalars['String'];
  id: Scalars['ID'];
  image: Scalars['String'];
  lastName: Scalars['String'];
  /**  amount of virtual money that can be changed back to real money  */
  redemptionBalance: Scalars['Float'];
  transactions: Array<TTransaction>;
};

/**  Representing a 1h timeframe of the company's stats  */
export type TCompanyStatsFragment = {
  __typename?: 'CompanyStatsFragment';
  grossRevenue: Scalars['Float'];
  netRevenue: Scalars['Float'];
  profit: Scalars['Float'];
  staff: Scalars['Float'];
  startOfHour: Scalars['DateTime'];
};

/**  A company user  */
export type TCompanyUser = TUser & {
  __typename?: 'CompanyUser';
  balance: Scalars['Float'];
  employees: Array<TEmployment>;
  employer: TEmployment;
  id: Scalars['ID'];
  image: Scalars['String'];
  name: Scalars['String'];
  products: Array<TProduct>;
  /**  amount of virtual money that can be changed back to real money  */
  redemptionBalance: Scalars['Float'];
  stats: Array<TCompanyStatsFragment>;
  transactions: Array<TTransaction>;
};

/**  Input for createEmploymentOffer mutation  */
export type TCreateEmploymentOfferInput = {
  citizenId: Scalars['ID'];
  /**  worktime per day in seconds  */
  minWorktime: Scalars['Int'];
  /**  virtual currency per hour  */
  salary: Scalars['Float'];
};

/**  Input for createGuest mutation  */
export type TCreateGuestInput = {
  cardId: Scalars['ID'];
  name?: InputMaybe<Scalars['String']>;
};

/**  Input for createVote mutation  */
export type TCreateVoteInput = {
  choices: Array<Scalars['String']>;
  description: Scalars['String'];
  endAt: Scalars['DateTime'];
  image: Scalars['File'];
  title: Scalars['String'];
  type: TVoteType;
};

/**  A customs transaction  */
export type TCustomsTransaction = TTransaction & {
  __typename?: 'CustomsTransaction';
  customs: Scalars['Float'];
  date: Scalars['DateTime'];
  id: Scalars['ID'];
  user: TUser;
};

/**  Input for chargeCustoms mutation  */
export type TCustomsTransactionInput = {
  user: TUserSignatureInput;
  value: Scalars['Float'];
};

/**  Input for editProduct mutation  */
export type TEditProductInput = {
  id: Scalars['ID'];
  name?: InputMaybe<Scalars['String']>;
  price?: InputMaybe<Scalars['Float']>;
};

/**  Contains information about an employment  */
export type TEmployment = {
  __typename?: 'Employment';
  company: TCompanyUser;
  employee: TCitizenUser;
  id: Scalars['ID'];
  /**  worktime per day in seconds (employment contract)  */
  minWorktime: Scalars['Int'];
  /**  virtual currency per hour (employment contract)  */
  salary: Scalars['Float'];
  /**  in seconds  */
  worktimeToday: Scalars['Int'];
  /**  in seconds  */
  worktimeYesterday: Scalars['Int'];
};

/**  A employment offer  */
export type TEmploymentOffer = {
  __typename?: 'EmploymentOffer';
  company: TCompanyUser;
  employee: TCitizenUser;
  id: Scalars['ID'];
  /**  worktime per day in seconds  */
  minWorktime: Scalars['Int'];
  /**  virtual currency per hour  */
  salary: Scalars['Float'];
  state: TEmploymentOfferState;
};

/**  state of employment offer  */
export type TEmploymentOfferState =
  | 'PENDING'
  | 'REJECTED';

/**  A guest user  */
export type TGuestUser = TUser & {
  __typename?: 'GuestUser';
  balance: Scalars['Float'];
  enteredAt: Scalars['DateTime'];
  id: Scalars['ID'];
  leftAt?: Maybe<Scalars['DateTime']>;
  name?: Maybe<Scalars['String']>;
  /**  amount of virtual money that can be changed back to real money  */
  redemptionBalance: Scalars['Float'];
  transactions: Array<TTransaction>;
};

/**  Mutations  */
export type TMutation = {
  __typename?: 'Mutation';
  acceptEmploymentOffer: TEmploymentOffer;
  addBook: TBook;
  addProduct: TProduct;
  cancelEmployment: Scalars['Void'];
  changeCurrencies: TChangeTransaction;
  chargeCustoms: TCustomsTransaction;
  createEmploymentOffer: TEmploymentOffer;
  createGuest: TGuestUser;
  createVote: TVote;
  /**  offer must be rejected to be deleted  */
  deleteEmploymentOffer: Scalars['Void'];
  editProduct: TProduct;
  /**  login as user; guests don't need a password  */
  login: TUser;
  logout: Scalars['Void'];
  payBonus: Array<TSalaryTransaction>;
  registerBorderCrossing: TBorderCrossing;
  rejectEmploymentOffer: TEmploymentOffer;
  removeGuest: Scalars['Void'];
  /**  remove product from the company's inventory  */
  removeProduct: Scalars['Void'];
  sell: TPurchaseTransaction;
  transferMoney: TTransferTransaction;
  vote: TVoteCitizenEdge;
  warehousePurchase: TPurchaseTransaction;
};


/**  Mutations  */
export type TMutationAcceptEmploymentOfferArgs = {
  id: Scalars['ID'];
};


/**  Mutations  */
export type TMutationAddBookArgs = {
  input: TAddBookInput;
};


/**  Mutations  */
export type TMutationAddProductArgs = {
  product: TAddProductInput;
};


/**  Mutations  */
export type TMutationCancelEmploymentArgs = {
  id: Scalars['ID'];
};


/**  Mutations  */
export type TMutationChangeCurrenciesArgs = {
  change: TChangeTransactionInput;
  password: Scalars['String'];
};


/**  Mutations  */
export type TMutationChargeCustomsArgs = {
  customs: TCustomsTransactionInput;
};


/**  Mutations  */
export type TMutationCreateEmploymentOfferArgs = {
  offer: TCreateEmploymentOfferInput;
};


/**  Mutations  */
export type TMutationCreateGuestArgs = {
  guest: TCreateGuestInput;
};


/**  Mutations  */
export type TMutationCreateVoteArgs = {
  vote: TCreateVoteInput;
};


/**  Mutations  */
export type TMutationDeleteEmploymentOfferArgs = {
  id: Scalars['ID'];
};


/**  Mutations  */
export type TMutationEditProductArgs = {
  product: TEditProductInput;
};


/**  Mutations  */
export type TMutationLoginArgs = {
  password?: InputMaybe<Scalars['String']>;
  user: TUserSignatureInput;
};


/**  Mutations  */
export type TMutationPayBonusArgs = {
  employmentIds: Array<Scalars['ID']>;
  value: Scalars['Float'];
};


/**  Mutations  */
export type TMutationRegisterBorderCrossingArgs = {
  citizenId: Scalars['ID'];
};


/**  Mutations  */
export type TMutationRejectEmploymentOfferArgs = {
  id: Scalars['ID'];
  reason?: InputMaybe<Scalars['String']>;
};


/**  Mutations  */
export type TMutationRemoveGuestArgs = {
  cardId: Scalars['ID'];
};


/**  Mutations  */
export type TMutationRemoveProductArgs = {
  productId: Scalars['ID'];
};


/**  Mutations  */
export type TMutationSellArgs = {
  password: Scalars['String'];
  purchase: TPurchaseTransactionInput;
};


/**  Mutations  */
export type TMutationTransferMoneyArgs = {
  transfer: TTransferTransactionInput;
};


/**  Mutations  */
export type TMutationVoteArgs = {
  vote: TVoteInput;
};


/**  Mutations  */
export type TMutationWarehousePurchaseArgs = {
  purchase: TWarehousePurchaseTransactionInput;
};

/**  A product of an company  */
export type TProduct = {
  __typename?: 'Product';
  company: TCompanyUser;
  grossRevenueTotal: Scalars['Float'];
  id: Scalars['ID'];
  name: Scalars['String'];
  price: Scalars['Float'];
  salesPerDay: Scalars['Float'];
  salesToday: Scalars['Int'];
  salesTotal: Scalars['Int'];
  stats: Array<TProductStatsFragment>;
};

/**  Representing a 1h timeframe of the product's stats */
export type TProductStatsFragment = {
  __typename?: 'ProductStatsFragment';
  grossRevenue: Scalars['Float'];
  sales: Scalars['Int'];
  startOfHour: Scalars['DateTime'];
};

/**  Tuple with product and amount for use in purchases  */
export type TPurchaseItem = {
  __typename?: 'PurchaseItem';
  amount: Scalars['Int'];
  product: TProduct;
};

/**  Tuple with product and amount for use in purchases  */
export type TPurchaseItemInput = {
  amount: Scalars['Int'];
  productId: Scalars['ID'];
};

/**  A purchase transaction  */
export type TPurchaseTransaction = TTransaction & {
  __typename?: 'PurchaseTransaction';
  company: TCompanyUser;
  customer: TUser;
  date: Scalars['DateTime'];
  discount?: Maybe<Scalars['Float']>;
  grossPrice: Scalars['Float'];
  id: Scalars['ID'];
  items: Array<TPurchaseItem>;
  netPrice: Scalars['Float'];
  tax: Scalars['Float'];
};

/**  Input for sell mutation  */
export type TPurchaseTransactionInput = {
  customer: TUserSignatureInput;
  discount?: InputMaybe<Scalars['Float']>;
  items: Array<TPurchaseItemInput>;
};

/**  Queries  */
export type TQuery = {
  __typename?: 'Query';
  author?: Maybe<TAuthor>;
  authors: Array<TAuthor>;
  book?: Maybe<TBook>;
  books: Array<TBook>;
  me: TUser;
  /**  for debugging only  */
  session: TSession;
  userFromCard: TUser;
  votes: Array<TVote>;
};


/**  Queries  */
export type TQueryAuthorArgs = {
  name: Scalars['String'];
};


/**  Queries  */
export type TQueryBookArgs = {
  title: Scalars['String'];
};


/**  Queries  */
export type TQueryUserFromCardArgs = {
  cardId: Scalars['ID'];
};

/**  A salary transaction  */
export type TSalaryTransaction = TTransaction & {
  __typename?: 'SalaryTransaction';
  date: Scalars['DateTime'];
  employment: TEmployment;
  grossValue: Scalars['Float'];
  id: Scalars['ID'];
  isBonus: Scalars['Boolean'];
  netValue: Scalars['Float'];
  tax: Scalars['Float'];
  /**  If null, it is a bonus payment  */
  worktime?: Maybe<TWorktime>;
};

/**  The current session  */
export type TSession = {
  __typename?: 'Session';
  id: Scalars['ID'];
  user?: Maybe<TUser>;
};

/**  Subscriptions  */
export type TSubscription = {
  __typename?: 'Subscription';
  addedBook: TBook;
};


/**  Subscriptions  */
export type TSubscriptionAddedBookArgs = {
  author?: InputMaybe<Scalars['String']>;
};

/**  Base type for transactions */
export type TTransaction = {
  date: Scalars['DateTime'];
  id: Scalars['ID'];
};

/**  A transfer transaction  */
export type TTransferTransaction = TTransaction & {
  __typename?: 'TransferTransaction';
  date: Scalars['DateTime'];
  id: Scalars['ID'];
  purpose?: Maybe<Scalars['String']>;
  receiver: TUser;
  sender: TUser;
  value: Scalars['Float'];
};

/**  Input for transferMoney mutation  */
export type TTransferTransactionInput = {
  purpose?: InputMaybe<Scalars['String']>;
  /**  receiver must be a citizen  */
  receiver: TUserSignatureInput;
  value: Scalars['Float'];
};

/**  Base type for users  */
export type TUser = {
  balance: Scalars['Float'];
  id: Scalars['ID'];
  /**  amount of virtual money that can be changed back to real money  */
  redemptionBalance: Scalars['Float'];
  transactions: Array<TTransaction>;
};

/**  Information needed to identify a user  */
export type TUserSignatureInput = {
  id: Scalars['String'];
  type: TUserType;
};

/**  type of user  */
export type TUserType =
  | 'CITIZEN'
  | 'COMPANY'
  | 'GUEST';

/**  A vote  */
export type TVote = {
  __typename?: 'Vote';
  chartInfo?: Maybe<Scalars['String']>;
  choices: Array<Scalars['String']>;
  description: Scalars['String'];
  endAt: Scalars['DateTime'];
  id: Scalars['ID'];
  image: Scalars['String'];
  result?: Maybe<Array<Scalars['Float']>>;
  title: Scalars['String'];
  type: TVoteType;
  votes: Array<TVoteCitizenEdge>;
};

/**  Contains information about a user vote  */
export type TVoteCitizenEdge = {
  __typename?: 'VoteCitizenEdge';
  user: TCitizenUser;
  vote: Array<Scalars['Float']>;
};

/**  Input for vote mutation  */
export type TVoteInput = {
  vote: Array<Scalars['Float']>;
  voteId: Scalars['ID'];
};

/**  type of vote  */
export type TVoteType =
  | 'CONSENSUS'
  | 'RADIO';

/**  Input for warehousePurchase mutation  */
export type TWarehousePurchaseTransactionInput = {
  items: Array<TPurchaseItemInput>;
};

/**  Information about a shift on an employee  */
export type TWorktime = {
  __typename?: 'Worktime';
  employment: TEmployment;
  /**  If null, the shift has not yet ended  */
  end?: Maybe<Scalars['DateTime']>;
  id: Scalars['ID'];
  start: Scalars['DateTime'];
};

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
  AddProductInput: TAddProductInput;
  AuthRole: TAuthRole;
  Author: ResolverTypeWrapper<IAuthorModel>;
  Book: ResolverTypeWrapper<IBookModel>;
  Boolean: ResolverTypeWrapper<Scalars['Boolean']>;
  BorderCrossing: ResolverTypeWrapper<IBorderCrossingModel>;
  BorderCrossingAction: TBorderCrossingAction;
  ChangeTransaction: ResolverTypeWrapper<IChangeTransactionModel>;
  ChangeTransactionAction: TChangeTransactionAction;
  ChangeTransactionInput: TChangeTransactionInput;
  CitizenUser: ResolverTypeWrapper<ICitizenUserModel>;
  CompanyStatsFragment: ResolverTypeWrapper<ICompanyStatsFragmentModel>;
  CompanyUser: ResolverTypeWrapper<ICompanyUserModel>;
  CreateEmploymentOfferInput: TCreateEmploymentOfferInput;
  CreateGuestInput: TCreateGuestInput;
  CreateVoteInput: TCreateVoteInput;
  CustomsTransaction: ResolverTypeWrapper<ICustomsTransactionModel>;
  CustomsTransactionInput: TCustomsTransactionInput;
  DateTime: ResolverTypeWrapper<Scalars['DateTime']>;
  EditProductInput: TEditProductInput;
  Employment: ResolverTypeWrapper<IEmploymentModel>;
  EmploymentOffer: ResolverTypeWrapper<IEmploymentOfferModel>;
  EmploymentOfferState: TEmploymentOfferState;
  File: ResolverTypeWrapper<Scalars['File']>;
  Float: ResolverTypeWrapper<Scalars['Float']>;
  GuestUser: ResolverTypeWrapper<IGuestUserModel>;
  ID: ResolverTypeWrapper<Scalars['ID']>;
  Int: ResolverTypeWrapper<Scalars['Int']>;
  Mutation: ResolverTypeWrapper<{}>;
  Product: ResolverTypeWrapper<IProductModel>;
  ProductStatsFragment: ResolverTypeWrapper<IProductStatsFragmentModel>;
  PurchaseItem: ResolverTypeWrapper<IPurchaseItemModel>;
  PurchaseItemInput: TPurchaseItemInput;
  PurchaseTransaction: ResolverTypeWrapper<IPurchaseTransactionModel>;
  PurchaseTransactionInput: TPurchaseTransactionInput;
  Query: ResolverTypeWrapper<{}>;
  SalaryTransaction: ResolverTypeWrapper<ISalaryTransactionModel>;
  Session: ResolverTypeWrapper<ISessionModel>;
  String: ResolverTypeWrapper<Scalars['String']>;
  Subscription: ResolverTypeWrapper<{}>;
  Transaction: TResolversTypes['ChangeTransaction'] | TResolversTypes['CustomsTransaction'] | TResolversTypes['PurchaseTransaction'] | TResolversTypes['SalaryTransaction'] | TResolversTypes['TransferTransaction'];
  TransferTransaction: ResolverTypeWrapper<ITransferTransactionModel>;
  TransferTransactionInput: TTransferTransactionInput;
  User: TResolversTypes['CitizenUser'] | TResolversTypes['CompanyUser'] | TResolversTypes['GuestUser'];
  UserSignatureInput: TUserSignatureInput;
  UserType: TUserType;
  Void: ResolverTypeWrapper<Scalars['Void']>;
  Vote: ResolverTypeWrapper<IVoteModel>;
  VoteCitizenEdge: ResolverTypeWrapper<IVoteCitizenEdgeModel>;
  VoteInput: TVoteInput;
  VoteType: TVoteType;
  WarehousePurchaseTransactionInput: TWarehousePurchaseTransactionInput;
  Worktime: ResolverTypeWrapper<IWorktimeModel>;
}>;

/** Mapping between all available schema types and the resolvers parents */
export type TResolversParentTypes = ResolversObject<{
  AddBookInput: TAddBookInput;
  AddProductInput: TAddProductInput;
  Author: IAuthorModel;
  Book: IBookModel;
  Boolean: Scalars['Boolean'];
  BorderCrossing: IBorderCrossingModel;
  ChangeTransaction: IChangeTransactionModel;
  ChangeTransactionInput: TChangeTransactionInput;
  CitizenUser: ICitizenUserModel;
  CompanyStatsFragment: ICompanyStatsFragmentModel;
  CompanyUser: ICompanyUserModel;
  CreateEmploymentOfferInput: TCreateEmploymentOfferInput;
  CreateGuestInput: TCreateGuestInput;
  CreateVoteInput: TCreateVoteInput;
  CustomsTransaction: ICustomsTransactionModel;
  CustomsTransactionInput: TCustomsTransactionInput;
  DateTime: Scalars['DateTime'];
  EditProductInput: TEditProductInput;
  Employment: IEmploymentModel;
  EmploymentOffer: IEmploymentOfferModel;
  File: Scalars['File'];
  Float: Scalars['Float'];
  GuestUser: IGuestUserModel;
  ID: Scalars['ID'];
  Int: Scalars['Int'];
  Mutation: {};
  Product: IProductModel;
  ProductStatsFragment: IProductStatsFragmentModel;
  PurchaseItem: IPurchaseItemModel;
  PurchaseItemInput: TPurchaseItemInput;
  PurchaseTransaction: IPurchaseTransactionModel;
  PurchaseTransactionInput: TPurchaseTransactionInput;
  Query: {};
  SalaryTransaction: ISalaryTransactionModel;
  Session: ISessionModel;
  String: Scalars['String'];
  Subscription: {};
  Transaction: TResolversParentTypes['ChangeTransaction'] | TResolversParentTypes['CustomsTransaction'] | TResolversParentTypes['PurchaseTransaction'] | TResolversParentTypes['SalaryTransaction'] | TResolversParentTypes['TransferTransaction'];
  TransferTransaction: ITransferTransactionModel;
  TransferTransactionInput: TTransferTransactionInput;
  User: TResolversParentTypes['CitizenUser'] | TResolversParentTypes['CompanyUser'] | TResolversParentTypes['GuestUser'];
  UserSignatureInput: TUserSignatureInput;
  Void: Scalars['Void'];
  Vote: IVoteModel;
  VoteCitizenEdge: IVoteCitizenEdgeModel;
  VoteInput: TVoteInput;
  WarehousePurchaseTransactionInput: TWarehousePurchaseTransactionInput;
  Worktime: IWorktimeModel;
}>;

export type TAuthDirectiveArgs = {
  role?: Maybe<Array<TAuthRole>>;
};

export type TAuthDirectiveResolver<Result, Parent, ContextType = IContext, Args = TAuthDirectiveArgs> = DirectiveResolverFn<Result, Parent, ContextType, Args>;

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

export type TBorderCrossingResolvers<ContextType = IContext, ParentType extends TResolversParentTypes['BorderCrossing'] = TResolversParentTypes['BorderCrossing']> = ResolversObject<{
  action?: Resolver<TResolversTypes['BorderCrossingAction'], ParentType, ContextType>;
  citizen?: Resolver<TResolversTypes['CitizenUser'], ParentType, ContextType>;
  date?: Resolver<TResolversTypes['DateTime'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type TChangeTransactionResolvers<ContextType = IContext, ParentType extends TResolversParentTypes['ChangeTransaction'] = TResolversParentTypes['ChangeTransaction']> = ResolversObject<{
  action?: Resolver<TResolversTypes['ChangeTransactionAction'], ParentType, ContextType>;
  date?: Resolver<TResolversTypes['DateTime'], ParentType, ContextType>;
  id?: Resolver<TResolversTypes['ID'], ParentType, ContextType>;
  user?: Resolver<TResolversTypes['User'], ParentType, ContextType>;
  valueReal?: Resolver<TResolversTypes['Float'], ParentType, ContextType>;
  valueVirtual?: Resolver<TResolversTypes['Float'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type TCitizenUserResolvers<ContextType = IContext, ParentType extends TResolversParentTypes['CitizenUser'] = TResolversParentTypes['CitizenUser']> = ResolversObject<{
  balance?: Resolver<TResolversTypes['Float'], ParentType, ContextType>;
  employment?: Resolver<Maybe<TResolversTypes['Employment']>, ParentType, ContextType>;
  firstName?: Resolver<TResolversTypes['String'], ParentType, ContextType>;
  id?: Resolver<TResolversTypes['ID'], ParentType, ContextType>;
  image?: Resolver<TResolversTypes['String'], ParentType, ContextType>;
  lastName?: Resolver<TResolversTypes['String'], ParentType, ContextType>;
  redemptionBalance?: Resolver<TResolversTypes['Float'], ParentType, ContextType>;
  transactions?: Resolver<Array<TResolversTypes['Transaction']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type TCompanyStatsFragmentResolvers<ContextType = IContext, ParentType extends TResolversParentTypes['CompanyStatsFragment'] = TResolversParentTypes['CompanyStatsFragment']> = ResolversObject<{
  grossRevenue?: Resolver<TResolversTypes['Float'], ParentType, ContextType>;
  netRevenue?: Resolver<TResolversTypes['Float'], ParentType, ContextType>;
  profit?: Resolver<TResolversTypes['Float'], ParentType, ContextType>;
  staff?: Resolver<TResolversTypes['Float'], ParentType, ContextType>;
  startOfHour?: Resolver<TResolversTypes['DateTime'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type TCompanyUserResolvers<ContextType = IContext, ParentType extends TResolversParentTypes['CompanyUser'] = TResolversParentTypes['CompanyUser']> = ResolversObject<{
  balance?: Resolver<TResolversTypes['Float'], ParentType, ContextType>;
  employees?: Resolver<Array<TResolversTypes['Employment']>, ParentType, ContextType>;
  employer?: Resolver<TResolversTypes['Employment'], ParentType, ContextType>;
  id?: Resolver<TResolversTypes['ID'], ParentType, ContextType>;
  image?: Resolver<TResolversTypes['String'], ParentType, ContextType>;
  name?: Resolver<TResolversTypes['String'], ParentType, ContextType>;
  products?: Resolver<Array<TResolversTypes['Product']>, ParentType, ContextType>;
  redemptionBalance?: Resolver<TResolversTypes['Float'], ParentType, ContextType>;
  stats?: Resolver<Array<TResolversTypes['CompanyStatsFragment']>, ParentType, ContextType>;
  transactions?: Resolver<Array<TResolversTypes['Transaction']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type TCustomsTransactionResolvers<ContextType = IContext, ParentType extends TResolversParentTypes['CustomsTransaction'] = TResolversParentTypes['CustomsTransaction']> = ResolversObject<{
  customs?: Resolver<TResolversTypes['Float'], ParentType, ContextType>;
  date?: Resolver<TResolversTypes['DateTime'], ParentType, ContextType>;
  id?: Resolver<TResolversTypes['ID'], ParentType, ContextType>;
  user?: Resolver<TResolversTypes['User'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export interface TDateTimeScalarConfig extends GraphQLScalarTypeConfig<TResolversTypes['DateTime'], any> {
  name: 'DateTime';
}

export type TEmploymentResolvers<ContextType = IContext, ParentType extends TResolversParentTypes['Employment'] = TResolversParentTypes['Employment']> = ResolversObject<{
  company?: Resolver<TResolversTypes['CompanyUser'], ParentType, ContextType>;
  employee?: Resolver<TResolversTypes['CitizenUser'], ParentType, ContextType>;
  id?: Resolver<TResolversTypes['ID'], ParentType, ContextType>;
  minWorktime?: Resolver<TResolversTypes['Int'], ParentType, ContextType>;
  salary?: Resolver<TResolversTypes['Float'], ParentType, ContextType>;
  worktimeToday?: Resolver<TResolversTypes['Int'], ParentType, ContextType>;
  worktimeYesterday?: Resolver<TResolversTypes['Int'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type TEmploymentOfferResolvers<ContextType = IContext, ParentType extends TResolversParentTypes['EmploymentOffer'] = TResolversParentTypes['EmploymentOffer']> = ResolversObject<{
  company?: Resolver<TResolversTypes['CompanyUser'], ParentType, ContextType>;
  employee?: Resolver<TResolversTypes['CitizenUser'], ParentType, ContextType>;
  id?: Resolver<TResolversTypes['ID'], ParentType, ContextType>;
  minWorktime?: Resolver<TResolversTypes['Int'], ParentType, ContextType>;
  salary?: Resolver<TResolversTypes['Float'], ParentType, ContextType>;
  state?: Resolver<TResolversTypes['EmploymentOfferState'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export interface TFileScalarConfig extends GraphQLScalarTypeConfig<TResolversTypes['File'], any> {
  name: 'File';
}

export type TGuestUserResolvers<ContextType = IContext, ParentType extends TResolversParentTypes['GuestUser'] = TResolversParentTypes['GuestUser']> = ResolversObject<{
  balance?: Resolver<TResolversTypes['Float'], ParentType, ContextType>;
  enteredAt?: Resolver<TResolversTypes['DateTime'], ParentType, ContextType>;
  id?: Resolver<TResolversTypes['ID'], ParentType, ContextType>;
  leftAt?: Resolver<Maybe<TResolversTypes['DateTime']>, ParentType, ContextType>;
  name?: Resolver<Maybe<TResolversTypes['String']>, ParentType, ContextType>;
  redemptionBalance?: Resolver<TResolversTypes['Float'], ParentType, ContextType>;
  transactions?: Resolver<Array<TResolversTypes['Transaction']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type TMutationResolvers<ContextType = IContext, ParentType extends TResolversParentTypes['Mutation'] = TResolversParentTypes['Mutation']> = ResolversObject<{
  acceptEmploymentOffer?: Resolver<TResolversTypes['EmploymentOffer'], ParentType, ContextType, RequireFields<TMutationAcceptEmploymentOfferArgs, 'id'>>;
  addBook?: Resolver<TResolversTypes['Book'], ParentType, ContextType, RequireFields<TMutationAddBookArgs, 'input'>>;
  addProduct?: Resolver<TResolversTypes['Product'], ParentType, ContextType, RequireFields<TMutationAddProductArgs, 'product'>>;
  cancelEmployment?: Resolver<TResolversTypes['Void'], ParentType, ContextType, RequireFields<TMutationCancelEmploymentArgs, 'id'>>;
  changeCurrencies?: Resolver<TResolversTypes['ChangeTransaction'], ParentType, ContextType, RequireFields<TMutationChangeCurrenciesArgs, 'change' | 'password'>>;
  chargeCustoms?: Resolver<TResolversTypes['CustomsTransaction'], ParentType, ContextType, RequireFields<TMutationChargeCustomsArgs, 'customs'>>;
  createEmploymentOffer?: Resolver<TResolversTypes['EmploymentOffer'], ParentType, ContextType, RequireFields<TMutationCreateEmploymentOfferArgs, 'offer'>>;
  createGuest?: Resolver<TResolversTypes['GuestUser'], ParentType, ContextType, RequireFields<TMutationCreateGuestArgs, 'guest'>>;
  createVote?: Resolver<TResolversTypes['Vote'], ParentType, ContextType, RequireFields<TMutationCreateVoteArgs, 'vote'>>;
  deleteEmploymentOffer?: Resolver<TResolversTypes['Void'], ParentType, ContextType, RequireFields<TMutationDeleteEmploymentOfferArgs, 'id'>>;
  editProduct?: Resolver<TResolversTypes['Product'], ParentType, ContextType, RequireFields<TMutationEditProductArgs, 'product'>>;
  login?: Resolver<TResolversTypes['User'], ParentType, ContextType, RequireFields<TMutationLoginArgs, 'user'>>;
  logout?: Resolver<TResolversTypes['Void'], ParentType, ContextType>;
  payBonus?: Resolver<Array<TResolversTypes['SalaryTransaction']>, ParentType, ContextType, RequireFields<TMutationPayBonusArgs, 'employmentIds' | 'value'>>;
  registerBorderCrossing?: Resolver<TResolversTypes['BorderCrossing'], ParentType, ContextType, RequireFields<TMutationRegisterBorderCrossingArgs, 'citizenId'>>;
  rejectEmploymentOffer?: Resolver<TResolversTypes['EmploymentOffer'], ParentType, ContextType, RequireFields<TMutationRejectEmploymentOfferArgs, 'id'>>;
  removeGuest?: Resolver<TResolversTypes['Void'], ParentType, ContextType, RequireFields<TMutationRemoveGuestArgs, 'cardId'>>;
  removeProduct?: Resolver<TResolversTypes['Void'], ParentType, ContextType, RequireFields<TMutationRemoveProductArgs, 'productId'>>;
  sell?: Resolver<TResolversTypes['PurchaseTransaction'], ParentType, ContextType, RequireFields<TMutationSellArgs, 'password' | 'purchase'>>;
  transferMoney?: Resolver<TResolversTypes['TransferTransaction'], ParentType, ContextType, RequireFields<TMutationTransferMoneyArgs, 'transfer'>>;
  vote?: Resolver<TResolversTypes['VoteCitizenEdge'], ParentType, ContextType, RequireFields<TMutationVoteArgs, 'vote'>>;
  warehousePurchase?: Resolver<TResolversTypes['PurchaseTransaction'], ParentType, ContextType, RequireFields<TMutationWarehousePurchaseArgs, 'purchase'>>;
}>;

export type TProductResolvers<ContextType = IContext, ParentType extends TResolversParentTypes['Product'] = TResolversParentTypes['Product']> = ResolversObject<{
  company?: Resolver<TResolversTypes['CompanyUser'], ParentType, ContextType>;
  grossRevenueTotal?: Resolver<TResolversTypes['Float'], ParentType, ContextType>;
  id?: Resolver<TResolversTypes['ID'], ParentType, ContextType>;
  name?: Resolver<TResolversTypes['String'], ParentType, ContextType>;
  price?: Resolver<TResolversTypes['Float'], ParentType, ContextType>;
  salesPerDay?: Resolver<TResolversTypes['Float'], ParentType, ContextType>;
  salesToday?: Resolver<TResolversTypes['Int'], ParentType, ContextType>;
  salesTotal?: Resolver<TResolversTypes['Int'], ParentType, ContextType>;
  stats?: Resolver<Array<TResolversTypes['ProductStatsFragment']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type TProductStatsFragmentResolvers<ContextType = IContext, ParentType extends TResolversParentTypes['ProductStatsFragment'] = TResolversParentTypes['ProductStatsFragment']> = ResolversObject<{
  grossRevenue?: Resolver<TResolversTypes['Float'], ParentType, ContextType>;
  sales?: Resolver<TResolversTypes['Int'], ParentType, ContextType>;
  startOfHour?: Resolver<TResolversTypes['DateTime'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type TPurchaseItemResolvers<ContextType = IContext, ParentType extends TResolversParentTypes['PurchaseItem'] = TResolversParentTypes['PurchaseItem']> = ResolversObject<{
  amount?: Resolver<TResolversTypes['Int'], ParentType, ContextType>;
  product?: Resolver<TResolversTypes['Product'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type TPurchaseTransactionResolvers<ContextType = IContext, ParentType extends TResolversParentTypes['PurchaseTransaction'] = TResolversParentTypes['PurchaseTransaction']> = ResolversObject<{
  company?: Resolver<TResolversTypes['CompanyUser'], ParentType, ContextType>;
  customer?: Resolver<TResolversTypes['User'], ParentType, ContextType>;
  date?: Resolver<TResolversTypes['DateTime'], ParentType, ContextType>;
  discount?: Resolver<Maybe<TResolversTypes['Float']>, ParentType, ContextType>;
  grossPrice?: Resolver<TResolversTypes['Float'], ParentType, ContextType>;
  id?: Resolver<TResolversTypes['ID'], ParentType, ContextType>;
  items?: Resolver<Array<TResolversTypes['PurchaseItem']>, ParentType, ContextType>;
  netPrice?: Resolver<TResolversTypes['Float'], ParentType, ContextType>;
  tax?: Resolver<TResolversTypes['Float'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type TQueryResolvers<ContextType = IContext, ParentType extends TResolversParentTypes['Query'] = TResolversParentTypes['Query']> = ResolversObject<{
  author?: Resolver<Maybe<TResolversTypes['Author']>, ParentType, ContextType, RequireFields<TQueryAuthorArgs, 'name'>>;
  authors?: Resolver<Array<TResolversTypes['Author']>, ParentType, ContextType>;
  book?: Resolver<Maybe<TResolversTypes['Book']>, ParentType, ContextType, RequireFields<TQueryBookArgs, 'title'>>;
  books?: Resolver<Array<TResolversTypes['Book']>, ParentType, ContextType>;
  me?: Resolver<TResolversTypes['User'], ParentType, ContextType>;
  session?: Resolver<TResolversTypes['Session'], ParentType, ContextType>;
  userFromCard?: Resolver<TResolversTypes['User'], ParentType, ContextType, RequireFields<TQueryUserFromCardArgs, 'cardId'>>;
  votes?: Resolver<Array<TResolversTypes['Vote']>, ParentType, ContextType>;
}>;

export type TSalaryTransactionResolvers<ContextType = IContext, ParentType extends TResolversParentTypes['SalaryTransaction'] = TResolversParentTypes['SalaryTransaction']> = ResolversObject<{
  date?: Resolver<TResolversTypes['DateTime'], ParentType, ContextType>;
  employment?: Resolver<TResolversTypes['Employment'], ParentType, ContextType>;
  grossValue?: Resolver<TResolversTypes['Float'], ParentType, ContextType>;
  id?: Resolver<TResolversTypes['ID'], ParentType, ContextType>;
  isBonus?: Resolver<TResolversTypes['Boolean'], ParentType, ContextType>;
  netValue?: Resolver<TResolversTypes['Float'], ParentType, ContextType>;
  tax?: Resolver<TResolversTypes['Float'], ParentType, ContextType>;
  worktime?: Resolver<Maybe<TResolversTypes['Worktime']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type TSessionResolvers<ContextType = IContext, ParentType extends TResolversParentTypes['Session'] = TResolversParentTypes['Session']> = ResolversObject<{
  id?: Resolver<TResolversTypes['ID'], ParentType, ContextType>;
  user?: Resolver<Maybe<TResolversTypes['User']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type TSubscriptionResolvers<ContextType = IContext, ParentType extends TResolversParentTypes['Subscription'] = TResolversParentTypes['Subscription']> = ResolversObject<{
  addedBook?: SubscriptionResolver<TResolversTypes['Book'], "addedBook", ParentType, ContextType, Partial<TSubscriptionAddedBookArgs>>;
}>;

export type TTransactionResolvers<ContextType = IContext, ParentType extends TResolversParentTypes['Transaction'] = TResolversParentTypes['Transaction']> = ResolversObject<{
  __resolveType: TypeResolveFn<'ChangeTransaction' | 'CustomsTransaction' | 'PurchaseTransaction' | 'SalaryTransaction' | 'TransferTransaction', ParentType, ContextType>;
  date?: Resolver<TResolversTypes['DateTime'], ParentType, ContextType>;
  id?: Resolver<TResolversTypes['ID'], ParentType, ContextType>;
}>;

export type TTransferTransactionResolvers<ContextType = IContext, ParentType extends TResolversParentTypes['TransferTransaction'] = TResolversParentTypes['TransferTransaction']> = ResolversObject<{
  date?: Resolver<TResolversTypes['DateTime'], ParentType, ContextType>;
  id?: Resolver<TResolversTypes['ID'], ParentType, ContextType>;
  purpose?: Resolver<Maybe<TResolversTypes['String']>, ParentType, ContextType>;
  receiver?: Resolver<TResolversTypes['User'], ParentType, ContextType>;
  sender?: Resolver<TResolversTypes['User'], ParentType, ContextType>;
  value?: Resolver<TResolversTypes['Float'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type TUserResolvers<ContextType = IContext, ParentType extends TResolversParentTypes['User'] = TResolversParentTypes['User']> = ResolversObject<{
  __resolveType: TypeResolveFn<'CitizenUser' | 'CompanyUser' | 'GuestUser', ParentType, ContextType>;
  balance?: Resolver<TResolversTypes['Float'], ParentType, ContextType>;
  id?: Resolver<TResolversTypes['ID'], ParentType, ContextType>;
  redemptionBalance?: Resolver<TResolversTypes['Float'], ParentType, ContextType>;
  transactions?: Resolver<Array<TResolversTypes['Transaction']>, ParentType, ContextType>;
}>;

export interface TVoidScalarConfig extends GraphQLScalarTypeConfig<TResolversTypes['Void'], any> {
  name: 'Void';
}

export type TVoteResolvers<ContextType = IContext, ParentType extends TResolversParentTypes['Vote'] = TResolversParentTypes['Vote']> = ResolversObject<{
  chartInfo?: Resolver<Maybe<TResolversTypes['String']>, ParentType, ContextType>;
  choices?: Resolver<Array<TResolversTypes['String']>, ParentType, ContextType>;
  description?: Resolver<TResolversTypes['String'], ParentType, ContextType>;
  endAt?: Resolver<TResolversTypes['DateTime'], ParentType, ContextType>;
  id?: Resolver<TResolversTypes['ID'], ParentType, ContextType>;
  image?: Resolver<TResolversTypes['String'], ParentType, ContextType>;
  result?: Resolver<Maybe<Array<TResolversTypes['Float']>>, ParentType, ContextType>;
  title?: Resolver<TResolversTypes['String'], ParentType, ContextType>;
  type?: Resolver<TResolversTypes['VoteType'], ParentType, ContextType>;
  votes?: Resolver<Array<TResolversTypes['VoteCitizenEdge']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type TVoteCitizenEdgeResolvers<ContextType = IContext, ParentType extends TResolversParentTypes['VoteCitizenEdge'] = TResolversParentTypes['VoteCitizenEdge']> = ResolversObject<{
  user?: Resolver<TResolversTypes['CitizenUser'], ParentType, ContextType>;
  vote?: Resolver<Array<TResolversTypes['Float']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type TWorktimeResolvers<ContextType = IContext, ParentType extends TResolversParentTypes['Worktime'] = TResolversParentTypes['Worktime']> = ResolversObject<{
  employment?: Resolver<TResolversTypes['Employment'], ParentType, ContextType>;
  end?: Resolver<Maybe<TResolversTypes['DateTime']>, ParentType, ContextType>;
  id?: Resolver<TResolversTypes['ID'], ParentType, ContextType>;
  start?: Resolver<TResolversTypes['DateTime'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type TResolvers<ContextType = IContext> = ResolversObject<{
  Author?: TAuthorResolvers<ContextType>;
  Book?: TBookResolvers<ContextType>;
  BorderCrossing?: TBorderCrossingResolvers<ContextType>;
  ChangeTransaction?: TChangeTransactionResolvers<ContextType>;
  CitizenUser?: TCitizenUserResolvers<ContextType>;
  CompanyStatsFragment?: TCompanyStatsFragmentResolvers<ContextType>;
  CompanyUser?: TCompanyUserResolvers<ContextType>;
  CustomsTransaction?: TCustomsTransactionResolvers<ContextType>;
  DateTime?: GraphQLScalarType;
  Employment?: TEmploymentResolvers<ContextType>;
  EmploymentOffer?: TEmploymentOfferResolvers<ContextType>;
  File?: GraphQLScalarType;
  GuestUser?: TGuestUserResolvers<ContextType>;
  Mutation?: TMutationResolvers<ContextType>;
  Product?: TProductResolvers<ContextType>;
  ProductStatsFragment?: TProductStatsFragmentResolvers<ContextType>;
  PurchaseItem?: TPurchaseItemResolvers<ContextType>;
  PurchaseTransaction?: TPurchaseTransactionResolvers<ContextType>;
  Query?: TQueryResolvers<ContextType>;
  SalaryTransaction?: TSalaryTransactionResolvers<ContextType>;
  Session?: TSessionResolvers<ContextType>;
  Subscription?: TSubscriptionResolvers<ContextType>;
  Transaction?: TTransactionResolvers<ContextType>;
  TransferTransaction?: TTransferTransactionResolvers<ContextType>;
  User?: TUserResolvers<ContextType>;
  Void?: GraphQLScalarType;
  Vote?: TVoteResolvers<ContextType>;
  VoteCitizenEdge?: TVoteCitizenEdgeResolvers<ContextType>;
  Worktime?: TWorktimeResolvers<ContextType>;
}>;

export type TDirectiveResolvers<ContextType = IContext> = ResolversObject<{
  auth?: TAuthDirectiveResolver<any, any, ContextType>;
}>;

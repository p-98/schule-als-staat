import { GraphQLResolveInfo, GraphQLScalarType, GraphQLScalarTypeConfig } from 'graphql';
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
  /**  Javascript Date object  */
  Date: any;
  /**  For file uploads; automatically handled by graphql-yoga  */
  File: any;
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
  date: Scalars['Date'];
};

/**  action of BorderCrossing  */
export type TBorderCrossingAction =
  | 'ENTER'
  | 'LEAVE';

/**  A change transaction  */
export type TChangeTransaction = TTransaction & {
  __typename?: 'ChangeTransaction';
  baseCurrency: TCurrency;
  baseValue: Scalars['Float'];
  date: Scalars['Date'];
  id: Scalars['ID'];
  targetCurrency: TCurrency;
  targetValue: Scalars['Float'];
  user: TUser;
};

/**  Input for changeCurrencies mutation  */
export type TChangeTransactionInput = {
  user: TUserSignatureInput;
  /**  value in the virtual currency  */
  value: Scalars['Float'];
};

/**  A citizen user  */
export type TCitizenUser = TUser & {
  __typename?: 'CitizenUser';
  balance: Scalars['Float'];
  employment?: Maybe<TCompanyEmployeeEdge>;
  firstName: Scalars['String'];
  id: Scalars['ID'];
  image: Scalars['String'];
  lastName: Scalars['String'];
  name: Scalars['String'];
  /**  amount of virtual money that can be changed back to real money  */
  redemptionBalance: Scalars['Float'];
  transactions: Array<TTransaction>;
};

/**  Contains information about an employment  */
export type TCompanyEmployeeEdge = {
  __typename?: 'CompanyEmployeeEdge';
  /**  null if citizen is not currently working  */
  activeSince?: Maybe<Scalars['Date']>;
  company: TCompanyUser;
  employee: TCitizenUser;
  /**  working hours per day  */
  hours: Scalars['Float'];
  /**  virtual currency per hour (employment contract)  */
  salary: Scalars['Float'];
  worktimeToday: Scalars['Float'];
  worktimeYesterday: Scalars['Float'];
};

/**  A company user  */
export type TCompanyUser = TUser & {
  __typename?: 'CompanyUser';
  balance: Scalars['Float'];
  employees: Array<TCompanyEmployeeEdge>;
  employer: TCompanyEmployeeEdge;
  finances: Array<TFinancesFragment>;
  id: Scalars['ID'];
  image: Scalars['String'];
  name: Scalars['String'];
  products: Array<TProduct>;
  /**  amount of virtual money that can be changed back to real money  */
  redemptionBalance: Scalars['Float'];
  transactions: Array<TTransaction>;
};

/**  Input for createEmploymentContractOffer mutation  */
export type TCreateEmploymentContractOfferInput = {
  citizenID: Scalars['ID'];
  /**  working hours per day  */
  hours: Scalars['Float'];
  /**  virtual currency per hour  */
  salary: Scalars['Float'];
};

/**  Input for createGuest mutation  */
export type TCreateGuestInput = {
  name?: InputMaybe<Scalars['String']>;
};

/**  Input for createVote mutation  */
export type TCreateVoteInput = {
  description: Scalars['String'];
  end?: InputMaybe<Scalars['Date']>;
  image?: InputMaybe<Scalars['File']>;
  items: Array<Scalars['String']>;
  title: Scalars['String'];
};

/**  Currency types  */
export type TCurrency =
  | 'REAL'
  | 'VIRTUAL';

/**  A customs transaction  */
export type TCustomsTransaction = TTransaction & {
  __typename?: 'CustomsTransaction';
  customs: Scalars['Float'];
  date: Scalars['Date'];
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

/**  A employment contract offer  */
export type TEmploymentContractOffer = {
  __typename?: 'EmploymentContractOffer';
  company: TCompanyUser;
  employee: TCitizenUser;
  /**  working hours per day  */
  hours: Scalars['Float'];
  id: Scalars['ID'];
  /**  virtual currency per hour  */
  salary: Scalars['Float'];
  state: TEmploymentContractOfferState;
};

/**  state of employment contract offer  */
export type TEmploymentContractOfferState =
  | 'PEDING'
  | 'REJECTED';

/**  Representing a 1h timeframe of the company's finances  */
export type TFinancesFragment = {
  __typename?: 'FinancesFragment';
  netRevenue: Scalars['Float'];
  profit: Scalars['Float'];
  staff: Scalars['Float'];
  startTime: Scalars['Date'];
};

/**  A guest user  */
export type TGuestUser = TUser & {
  __typename?: 'GuestUser';
  balance: Scalars['Float'];
  enter: Scalars['Date'];
  id: Scalars['ID'];
  leave?: Maybe<Scalars['Date']>;
  name?: Maybe<Scalars['String']>;
  /**  amount of virtual money that can be changed back to real money  */
  redemptionBalance: Scalars['Float'];
  transactions: Array<TTransaction>;
};

/**  Mutations  */
export type TMutation = {
  __typename?: 'Mutation';
  acceptEmploymentContractOffer: TEmploymentContractOffer;
  addBook: TBook;
  addProduct: TProduct;
  changeCurrencies: TChangeTransaction;
  chargeCustoms: TCustomsTransaction;
  createEmploymentContractOffer: TEmploymentContractOffer;
  createGuest: TGuestUser;
  createVote: TVote;
  /**  contract offer must be rejected to be deleted  */
  deleteEmploymentContractOffer: Scalars['Boolean'];
  editProduct: TProduct;
  fireEmployee: Scalars['Boolean'];
  /**  login as user; guests don't need a password  */
  login: TUser;
  logout: Scalars['Boolean'];
  payBonus: Array<TSalaryTransaction>;
  registerBorderCrossing: TBorderCrossing;
  rejectEmploymentContractOffer: TEmploymentContractOffer;
  removeGuest: Scalars['Boolean'];
  /**  remove product from the company's inventory  */
  removeProduct: Scalars['Boolean'];
  sell: TPurchaseTransaction;
  transferMoney: TTransferTransaction;
  vote: TVoteCitizenEdge;
  warehousePurchase: TPurchaseTransaction;
};


/**  Mutations  */
export type TMutationAcceptEmploymentContractOfferArgs = {
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
export type TMutationChangeCurrenciesArgs = {
  change: TChangeTransactionInput;
  password: Scalars['String'];
};


/**  Mutations  */
export type TMutationChargeCustomsArgs = {
  customs: TCustomsTransactionInput;
};


/**  Mutations  */
export type TMutationCreateEmploymentContractOfferArgs = {
  contract: TCreateEmploymentContractOfferInput;
};


/**  Mutations  */
export type TMutationCreateGuestArgs = {
  cardID: Scalars['ID'];
  guest?: InputMaybe<TCreateGuestInput>;
};


/**  Mutations  */
export type TMutationCreateVoteArgs = {
  vote: TCreateVoteInput;
};


/**  Mutations  */
export type TMutationDeleteEmploymentContractOfferArgs = {
  id: Scalars['ID'];
};


/**  Mutations  */
export type TMutationEditProductArgs = {
  product: TEditProductInput;
};


/**  Mutations  */
export type TMutationFireEmployeeArgs = {
  citizenID: Scalars['ID'];
};


/**  Mutations  */
export type TMutationLoginArgs = {
  password?: InputMaybe<Scalars['String']>;
  user: TUserSignatureInput;
};


/**  Mutations  */
export type TMutationPayBonusArgs = {
  employees: Array<Scalars['ID']>;
  value: Scalars['Float'];
};


/**  Mutations  */
export type TMutationRegisterBorderCrossingArgs = {
  citizenID: Scalars['ID'];
};


/**  Mutations  */
export type TMutationRejectEmploymentContractOfferArgs = {
  id: Scalars['ID'];
  reason?: InputMaybe<Scalars['String']>;
};


/**  Mutations  */
export type TMutationRemoveGuestArgs = {
  cardID: Scalars['ID'];
};


/**  Mutations  */
export type TMutationRemoveProductArgs = {
  productID: Scalars['ID'];
};


/**  Mutations  */
export type TMutationSellArgs = {
  password: Scalars['String'];
  purchase?: InputMaybe<TPurchaseTransactionInput>;
};


/**  Mutations  */
export type TMutationTransferMoneyArgs = {
  transfer?: InputMaybe<TTransferTransactionInput>;
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
  id: Scalars['ID'];
  name: Scalars['String'];
  price: Scalars['Float'];
  stats: Array<TStatsFragment>;
  todaySales: Scalars['Int'];
  totalGrossRevenue: Scalars['Float'];
  totalSales: Scalars['Int'];
  totalSalesPerDay: Scalars['Float'];
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
  productID: Scalars['ID'];
};

/**  A purchase transaction  */
export type TPurchaseTransaction = TTransaction & {
  __typename?: 'PurchaseTransaction';
  customer: TUser;
  date: Scalars['Date'];
  discount?: Maybe<Scalars['Float']>;
  grossPrice: Scalars['Float'];
  id: Scalars['ID'];
  items: Array<TPurchaseItem>;
  netPrice: Scalars['Float'];
  tax: Scalars['Float'];
  vendor: TCompanyUser;
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
  cardID: Scalars['ID'];
};

/**  A salary transaction  */
export type TSalaryTransaction = TTransaction & {
  __typename?: 'SalaryTransaction';
  date: Scalars['Date'];
  grossValue: Scalars['Float'];
  id: Scalars['ID'];
  netValue: Scalars['Float'];
  tax: Scalars['Float'];
  /**  workStart and workEnd are either both timestamps or null. If they are null, it is a bonus payment  */
  worStart?: Maybe<Scalars['Date']>;
  /**  workStart and workEnd are either both timestamps or null. If they are null, it is a bonus payment  */
  workEnd?: Maybe<Scalars['Date']>;
};

/**  The current session  */
export type TSession = {
  __typename?: 'Session';
  id: Scalars['ID'];
  user?: Maybe<TUser>;
};

/**  Representing a 1h timeframe of the product's stats */
export type TStatsFragment = {
  __typename?: 'StatsFragment';
  grossRevenue: Scalars['Float'];
  netRevenue: Scalars['Float'];
  sales: Scalars['Int'];
  startTime: Scalars['Date'];
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
  date: Scalars['Date'];
  id: Scalars['ID'];
};

/**  A transfer transaction  */
export type TTransferTransaction = TTransaction & {
  __typename?: 'TransferTransaction';
  date: Scalars['Date'];
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
  description: Scalars['String'];
  end: Scalars['Date'];
  id: Scalars['ID'];
  image: Scalars['String'];
  items: Array<Scalars['String']>;
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
  id: Scalars['ID'];
  vote?: InputMaybe<Array<Scalars['Float']>>;
};

/**  type of vote  */
export type TVoteType =
  | 'CONSENSUS'
  | 'RADIO';

/**  Input for warehousePurchase mutation  */
export type TWarehousePurchaseTransactionInput = {
  items: Array<TPurchaseItemInput>;
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
  BorderCrossing: ResolverTypeWrapper<TBorderCrossing>;
  BorderCrossingAction: TBorderCrossingAction;
  ChangeTransaction: ResolverTypeWrapper<TChangeTransaction>;
  ChangeTransactionInput: TChangeTransactionInput;
  CitizenUser: ResolverTypeWrapper<TCitizenUser>;
  CompanyEmployeeEdge: ResolverTypeWrapper<TCompanyEmployeeEdge>;
  CompanyUser: ResolverTypeWrapper<TCompanyUser>;
  CreateEmploymentContractOfferInput: TCreateEmploymentContractOfferInput;
  CreateGuestInput: TCreateGuestInput;
  CreateVoteInput: TCreateVoteInput;
  Currency: TCurrency;
  CustomsTransaction: ResolverTypeWrapper<TCustomsTransaction>;
  CustomsTransactionInput: TCustomsTransactionInput;
  Date: ResolverTypeWrapper<Scalars['Date']>;
  EditProductInput: TEditProductInput;
  EmploymentContractOffer: ResolverTypeWrapper<TEmploymentContractOffer>;
  EmploymentContractOfferState: TEmploymentContractOfferState;
  File: ResolverTypeWrapper<Scalars['File']>;
  FinancesFragment: ResolverTypeWrapper<TFinancesFragment>;
  Float: ResolverTypeWrapper<Scalars['Float']>;
  GuestUser: ResolverTypeWrapper<TGuestUser>;
  ID: ResolverTypeWrapper<Scalars['ID']>;
  Int: ResolverTypeWrapper<Scalars['Int']>;
  Mutation: ResolverTypeWrapper<{}>;
  Product: ResolverTypeWrapper<TProduct>;
  PurchaseItem: ResolverTypeWrapper<TPurchaseItem>;
  PurchaseItemInput: TPurchaseItemInput;
  PurchaseTransaction: ResolverTypeWrapper<TPurchaseTransaction>;
  PurchaseTransactionInput: TPurchaseTransactionInput;
  Query: ResolverTypeWrapper<{}>;
  SalaryTransaction: ResolverTypeWrapper<TSalaryTransaction>;
  Session: ResolverTypeWrapper<TSession>;
  StatsFragment: ResolverTypeWrapper<TStatsFragment>;
  String: ResolverTypeWrapper<Scalars['String']>;
  Subscription: ResolverTypeWrapper<{}>;
  Transaction: TResolversTypes['ChangeTransaction'] | TResolversTypes['CustomsTransaction'] | TResolversTypes['PurchaseTransaction'] | TResolversTypes['SalaryTransaction'] | TResolversTypes['TransferTransaction'];
  TransferTransaction: ResolverTypeWrapper<TTransferTransaction>;
  TransferTransactionInput: TTransferTransactionInput;
  User: TResolversTypes['CitizenUser'] | TResolversTypes['CompanyUser'] | TResolversTypes['GuestUser'];
  UserSignatureInput: TUserSignatureInput;
  UserType: TUserType;
  Vote: ResolverTypeWrapper<TVote>;
  VoteCitizenEdge: ResolverTypeWrapper<TVoteCitizenEdge>;
  VoteInput: TVoteInput;
  VoteType: TVoteType;
  WarehousePurchaseTransactionInput: TWarehousePurchaseTransactionInput;
}>;

/** Mapping between all available schema types and the resolvers parents */
export type TResolversParentTypes = ResolversObject<{
  AddBookInput: TAddBookInput;
  AddProductInput: TAddProductInput;
  Author: IAuthorModel;
  Book: IBookModel;
  Boolean: Scalars['Boolean'];
  BorderCrossing: TBorderCrossing;
  ChangeTransaction: TChangeTransaction;
  ChangeTransactionInput: TChangeTransactionInput;
  CitizenUser: TCitizenUser;
  CompanyEmployeeEdge: TCompanyEmployeeEdge;
  CompanyUser: TCompanyUser;
  CreateEmploymentContractOfferInput: TCreateEmploymentContractOfferInput;
  CreateGuestInput: TCreateGuestInput;
  CreateVoteInput: TCreateVoteInput;
  CustomsTransaction: TCustomsTransaction;
  CustomsTransactionInput: TCustomsTransactionInput;
  Date: Scalars['Date'];
  EditProductInput: TEditProductInput;
  EmploymentContractOffer: TEmploymentContractOffer;
  File: Scalars['File'];
  FinancesFragment: TFinancesFragment;
  Float: Scalars['Float'];
  GuestUser: TGuestUser;
  ID: Scalars['ID'];
  Int: Scalars['Int'];
  Mutation: {};
  Product: TProduct;
  PurchaseItem: TPurchaseItem;
  PurchaseItemInput: TPurchaseItemInput;
  PurchaseTransaction: TPurchaseTransaction;
  PurchaseTransactionInput: TPurchaseTransactionInput;
  Query: {};
  SalaryTransaction: TSalaryTransaction;
  Session: TSession;
  StatsFragment: TStatsFragment;
  String: Scalars['String'];
  Subscription: {};
  Transaction: TResolversParentTypes['ChangeTransaction'] | TResolversParentTypes['CustomsTransaction'] | TResolversParentTypes['PurchaseTransaction'] | TResolversParentTypes['SalaryTransaction'] | TResolversParentTypes['TransferTransaction'];
  TransferTransaction: TTransferTransaction;
  TransferTransactionInput: TTransferTransactionInput;
  User: TResolversParentTypes['CitizenUser'] | TResolversParentTypes['CompanyUser'] | TResolversParentTypes['GuestUser'];
  UserSignatureInput: TUserSignatureInput;
  Vote: TVote;
  VoteCitizenEdge: TVoteCitizenEdge;
  VoteInput: TVoteInput;
  WarehousePurchaseTransactionInput: TWarehousePurchaseTransactionInput;
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
  date?: Resolver<TResolversTypes['Date'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type TChangeTransactionResolvers<ContextType = IContext, ParentType extends TResolversParentTypes['ChangeTransaction'] = TResolversParentTypes['ChangeTransaction']> = ResolversObject<{
  baseCurrency?: Resolver<TResolversTypes['Currency'], ParentType, ContextType>;
  baseValue?: Resolver<TResolversTypes['Float'], ParentType, ContextType>;
  date?: Resolver<TResolversTypes['Date'], ParentType, ContextType>;
  id?: Resolver<TResolversTypes['ID'], ParentType, ContextType>;
  targetCurrency?: Resolver<TResolversTypes['Currency'], ParentType, ContextType>;
  targetValue?: Resolver<TResolversTypes['Float'], ParentType, ContextType>;
  user?: Resolver<TResolversTypes['User'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type TCitizenUserResolvers<ContextType = IContext, ParentType extends TResolversParentTypes['CitizenUser'] = TResolversParentTypes['CitizenUser']> = ResolversObject<{
  balance?: Resolver<TResolversTypes['Float'], ParentType, ContextType>;
  employment?: Resolver<Maybe<TResolversTypes['CompanyEmployeeEdge']>, ParentType, ContextType>;
  firstName?: Resolver<TResolversTypes['String'], ParentType, ContextType>;
  id?: Resolver<TResolversTypes['ID'], ParentType, ContextType>;
  image?: Resolver<TResolversTypes['String'], ParentType, ContextType>;
  lastName?: Resolver<TResolversTypes['String'], ParentType, ContextType>;
  name?: Resolver<TResolversTypes['String'], ParentType, ContextType>;
  redemptionBalance?: Resolver<TResolversTypes['Float'], ParentType, ContextType>;
  transactions?: Resolver<Array<TResolversTypes['Transaction']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type TCompanyEmployeeEdgeResolvers<ContextType = IContext, ParentType extends TResolversParentTypes['CompanyEmployeeEdge'] = TResolversParentTypes['CompanyEmployeeEdge']> = ResolversObject<{
  activeSince?: Resolver<Maybe<TResolversTypes['Date']>, ParentType, ContextType>;
  company?: Resolver<TResolversTypes['CompanyUser'], ParentType, ContextType>;
  employee?: Resolver<TResolversTypes['CitizenUser'], ParentType, ContextType>;
  hours?: Resolver<TResolversTypes['Float'], ParentType, ContextType>;
  salary?: Resolver<TResolversTypes['Float'], ParentType, ContextType>;
  worktimeToday?: Resolver<TResolversTypes['Float'], ParentType, ContextType>;
  worktimeYesterday?: Resolver<TResolversTypes['Float'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type TCompanyUserResolvers<ContextType = IContext, ParentType extends TResolversParentTypes['CompanyUser'] = TResolversParentTypes['CompanyUser']> = ResolversObject<{
  balance?: Resolver<TResolversTypes['Float'], ParentType, ContextType>;
  employees?: Resolver<Array<TResolversTypes['CompanyEmployeeEdge']>, ParentType, ContextType>;
  employer?: Resolver<TResolversTypes['CompanyEmployeeEdge'], ParentType, ContextType>;
  finances?: Resolver<Array<TResolversTypes['FinancesFragment']>, ParentType, ContextType>;
  id?: Resolver<TResolversTypes['ID'], ParentType, ContextType>;
  image?: Resolver<TResolversTypes['String'], ParentType, ContextType>;
  name?: Resolver<TResolversTypes['String'], ParentType, ContextType>;
  products?: Resolver<Array<TResolversTypes['Product']>, ParentType, ContextType>;
  redemptionBalance?: Resolver<TResolversTypes['Float'], ParentType, ContextType>;
  transactions?: Resolver<Array<TResolversTypes['Transaction']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type TCustomsTransactionResolvers<ContextType = IContext, ParentType extends TResolversParentTypes['CustomsTransaction'] = TResolversParentTypes['CustomsTransaction']> = ResolversObject<{
  customs?: Resolver<TResolversTypes['Float'], ParentType, ContextType>;
  date?: Resolver<TResolversTypes['Date'], ParentType, ContextType>;
  id?: Resolver<TResolversTypes['ID'], ParentType, ContextType>;
  user?: Resolver<TResolversTypes['User'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export interface TDateScalarConfig extends GraphQLScalarTypeConfig<TResolversTypes['Date'], any> {
  name: 'Date';
}

export type TEmploymentContractOfferResolvers<ContextType = IContext, ParentType extends TResolversParentTypes['EmploymentContractOffer'] = TResolversParentTypes['EmploymentContractOffer']> = ResolversObject<{
  company?: Resolver<TResolversTypes['CompanyUser'], ParentType, ContextType>;
  employee?: Resolver<TResolversTypes['CitizenUser'], ParentType, ContextType>;
  hours?: Resolver<TResolversTypes['Float'], ParentType, ContextType>;
  id?: Resolver<TResolversTypes['ID'], ParentType, ContextType>;
  salary?: Resolver<TResolversTypes['Float'], ParentType, ContextType>;
  state?: Resolver<TResolversTypes['EmploymentContractOfferState'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export interface TFileScalarConfig extends GraphQLScalarTypeConfig<TResolversTypes['File'], any> {
  name: 'File';
}

export type TFinancesFragmentResolvers<ContextType = IContext, ParentType extends TResolversParentTypes['FinancesFragment'] = TResolversParentTypes['FinancesFragment']> = ResolversObject<{
  netRevenue?: Resolver<TResolversTypes['Float'], ParentType, ContextType>;
  profit?: Resolver<TResolversTypes['Float'], ParentType, ContextType>;
  staff?: Resolver<TResolversTypes['Float'], ParentType, ContextType>;
  startTime?: Resolver<TResolversTypes['Date'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type TGuestUserResolvers<ContextType = IContext, ParentType extends TResolversParentTypes['GuestUser'] = TResolversParentTypes['GuestUser']> = ResolversObject<{
  balance?: Resolver<TResolversTypes['Float'], ParentType, ContextType>;
  enter?: Resolver<TResolversTypes['Date'], ParentType, ContextType>;
  id?: Resolver<TResolversTypes['ID'], ParentType, ContextType>;
  leave?: Resolver<Maybe<TResolversTypes['Date']>, ParentType, ContextType>;
  name?: Resolver<Maybe<TResolversTypes['String']>, ParentType, ContextType>;
  redemptionBalance?: Resolver<TResolversTypes['Float'], ParentType, ContextType>;
  transactions?: Resolver<Array<TResolversTypes['Transaction']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type TMutationResolvers<ContextType = IContext, ParentType extends TResolversParentTypes['Mutation'] = TResolversParentTypes['Mutation']> = ResolversObject<{
  acceptEmploymentContractOffer?: Resolver<TResolversTypes['EmploymentContractOffer'], ParentType, ContextType, RequireFields<TMutationAcceptEmploymentContractOfferArgs, 'id'>>;
  addBook?: Resolver<TResolversTypes['Book'], ParentType, ContextType, RequireFields<TMutationAddBookArgs, 'input'>>;
  addProduct?: Resolver<TResolversTypes['Product'], ParentType, ContextType, RequireFields<TMutationAddProductArgs, 'product'>>;
  changeCurrencies?: Resolver<TResolversTypes['ChangeTransaction'], ParentType, ContextType, RequireFields<TMutationChangeCurrenciesArgs, 'change' | 'password'>>;
  chargeCustoms?: Resolver<TResolversTypes['CustomsTransaction'], ParentType, ContextType, RequireFields<TMutationChargeCustomsArgs, 'customs'>>;
  createEmploymentContractOffer?: Resolver<TResolversTypes['EmploymentContractOffer'], ParentType, ContextType, RequireFields<TMutationCreateEmploymentContractOfferArgs, 'contract'>>;
  createGuest?: Resolver<TResolversTypes['GuestUser'], ParentType, ContextType, RequireFields<TMutationCreateGuestArgs, 'cardID'>>;
  createVote?: Resolver<TResolversTypes['Vote'], ParentType, ContextType, RequireFields<TMutationCreateVoteArgs, 'vote'>>;
  deleteEmploymentContractOffer?: Resolver<TResolversTypes['Boolean'], ParentType, ContextType, RequireFields<TMutationDeleteEmploymentContractOfferArgs, 'id'>>;
  editProduct?: Resolver<TResolversTypes['Product'], ParentType, ContextType, RequireFields<TMutationEditProductArgs, 'product'>>;
  fireEmployee?: Resolver<TResolversTypes['Boolean'], ParentType, ContextType, RequireFields<TMutationFireEmployeeArgs, 'citizenID'>>;
  login?: Resolver<TResolversTypes['User'], ParentType, ContextType, RequireFields<TMutationLoginArgs, 'user'>>;
  logout?: Resolver<TResolversTypes['Boolean'], ParentType, ContextType>;
  payBonus?: Resolver<Array<TResolversTypes['SalaryTransaction']>, ParentType, ContextType, RequireFields<TMutationPayBonusArgs, 'employees' | 'value'>>;
  registerBorderCrossing?: Resolver<TResolversTypes['BorderCrossing'], ParentType, ContextType, RequireFields<TMutationRegisterBorderCrossingArgs, 'citizenID'>>;
  rejectEmploymentContractOffer?: Resolver<TResolversTypes['EmploymentContractOffer'], ParentType, ContextType, RequireFields<TMutationRejectEmploymentContractOfferArgs, 'id'>>;
  removeGuest?: Resolver<TResolversTypes['Boolean'], ParentType, ContextType, RequireFields<TMutationRemoveGuestArgs, 'cardID'>>;
  removeProduct?: Resolver<TResolversTypes['Boolean'], ParentType, ContextType, RequireFields<TMutationRemoveProductArgs, 'productID'>>;
  sell?: Resolver<TResolversTypes['PurchaseTransaction'], ParentType, ContextType, RequireFields<TMutationSellArgs, 'password'>>;
  transferMoney?: Resolver<TResolversTypes['TransferTransaction'], ParentType, ContextType, Partial<TMutationTransferMoneyArgs>>;
  vote?: Resolver<TResolversTypes['VoteCitizenEdge'], ParentType, ContextType, RequireFields<TMutationVoteArgs, 'vote'>>;
  warehousePurchase?: Resolver<TResolversTypes['PurchaseTransaction'], ParentType, ContextType, RequireFields<TMutationWarehousePurchaseArgs, 'purchase'>>;
}>;

export type TProductResolvers<ContextType = IContext, ParentType extends TResolversParentTypes['Product'] = TResolversParentTypes['Product']> = ResolversObject<{
  id?: Resolver<TResolversTypes['ID'], ParentType, ContextType>;
  name?: Resolver<TResolversTypes['String'], ParentType, ContextType>;
  price?: Resolver<TResolversTypes['Float'], ParentType, ContextType>;
  stats?: Resolver<Array<TResolversTypes['StatsFragment']>, ParentType, ContextType>;
  todaySales?: Resolver<TResolversTypes['Int'], ParentType, ContextType>;
  totalGrossRevenue?: Resolver<TResolversTypes['Float'], ParentType, ContextType>;
  totalSales?: Resolver<TResolversTypes['Int'], ParentType, ContextType>;
  totalSalesPerDay?: Resolver<TResolversTypes['Float'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type TPurchaseItemResolvers<ContextType = IContext, ParentType extends TResolversParentTypes['PurchaseItem'] = TResolversParentTypes['PurchaseItem']> = ResolversObject<{
  amount?: Resolver<TResolversTypes['Int'], ParentType, ContextType>;
  product?: Resolver<TResolversTypes['Product'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type TPurchaseTransactionResolvers<ContextType = IContext, ParentType extends TResolversParentTypes['PurchaseTransaction'] = TResolversParentTypes['PurchaseTransaction']> = ResolversObject<{
  customer?: Resolver<TResolversTypes['User'], ParentType, ContextType>;
  date?: Resolver<TResolversTypes['Date'], ParentType, ContextType>;
  discount?: Resolver<Maybe<TResolversTypes['Float']>, ParentType, ContextType>;
  grossPrice?: Resolver<TResolversTypes['Float'], ParentType, ContextType>;
  id?: Resolver<TResolversTypes['ID'], ParentType, ContextType>;
  items?: Resolver<Array<TResolversTypes['PurchaseItem']>, ParentType, ContextType>;
  netPrice?: Resolver<TResolversTypes['Float'], ParentType, ContextType>;
  tax?: Resolver<TResolversTypes['Float'], ParentType, ContextType>;
  vendor?: Resolver<TResolversTypes['CompanyUser'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type TQueryResolvers<ContextType = IContext, ParentType extends TResolversParentTypes['Query'] = TResolversParentTypes['Query']> = ResolversObject<{
  author?: Resolver<Maybe<TResolversTypes['Author']>, ParentType, ContextType, RequireFields<TQueryAuthorArgs, 'name'>>;
  authors?: Resolver<Array<TResolversTypes['Author']>, ParentType, ContextType>;
  book?: Resolver<Maybe<TResolversTypes['Book']>, ParentType, ContextType, RequireFields<TQueryBookArgs, 'title'>>;
  books?: Resolver<Array<TResolversTypes['Book']>, ParentType, ContextType>;
  me?: Resolver<TResolversTypes['User'], ParentType, ContextType>;
  session?: Resolver<TResolversTypes['Session'], ParentType, ContextType>;
  userFromCard?: Resolver<TResolversTypes['User'], ParentType, ContextType, RequireFields<TQueryUserFromCardArgs, 'cardID'>>;
  votes?: Resolver<Array<TResolversTypes['Vote']>, ParentType, ContextType>;
}>;

export type TSalaryTransactionResolvers<ContextType = IContext, ParentType extends TResolversParentTypes['SalaryTransaction'] = TResolversParentTypes['SalaryTransaction']> = ResolversObject<{
  date?: Resolver<TResolversTypes['Date'], ParentType, ContextType>;
  grossValue?: Resolver<TResolversTypes['Float'], ParentType, ContextType>;
  id?: Resolver<TResolversTypes['ID'], ParentType, ContextType>;
  netValue?: Resolver<TResolversTypes['Float'], ParentType, ContextType>;
  tax?: Resolver<TResolversTypes['Float'], ParentType, ContextType>;
  worStart?: Resolver<Maybe<TResolversTypes['Date']>, ParentType, ContextType>;
  workEnd?: Resolver<Maybe<TResolversTypes['Date']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type TSessionResolvers<ContextType = IContext, ParentType extends TResolversParentTypes['Session'] = TResolversParentTypes['Session']> = ResolversObject<{
  id?: Resolver<TResolversTypes['ID'], ParentType, ContextType>;
  user?: Resolver<Maybe<TResolversTypes['User']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type TStatsFragmentResolvers<ContextType = IContext, ParentType extends TResolversParentTypes['StatsFragment'] = TResolversParentTypes['StatsFragment']> = ResolversObject<{
  grossRevenue?: Resolver<TResolversTypes['Float'], ParentType, ContextType>;
  netRevenue?: Resolver<TResolversTypes['Float'], ParentType, ContextType>;
  sales?: Resolver<TResolversTypes['Int'], ParentType, ContextType>;
  startTime?: Resolver<TResolversTypes['Date'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type TSubscriptionResolvers<ContextType = IContext, ParentType extends TResolversParentTypes['Subscription'] = TResolversParentTypes['Subscription']> = ResolversObject<{
  addedBook?: SubscriptionResolver<TResolversTypes['Book'], "addedBook", ParentType, ContextType, Partial<TSubscriptionAddedBookArgs>>;
}>;

export type TTransactionResolvers<ContextType = IContext, ParentType extends TResolversParentTypes['Transaction'] = TResolversParentTypes['Transaction']> = ResolversObject<{
  __resolveType: TypeResolveFn<'ChangeTransaction' | 'CustomsTransaction' | 'PurchaseTransaction' | 'SalaryTransaction' | 'TransferTransaction', ParentType, ContextType>;
  date?: Resolver<TResolversTypes['Date'], ParentType, ContextType>;
  id?: Resolver<TResolversTypes['ID'], ParentType, ContextType>;
}>;

export type TTransferTransactionResolvers<ContextType = IContext, ParentType extends TResolversParentTypes['TransferTransaction'] = TResolversParentTypes['TransferTransaction']> = ResolversObject<{
  date?: Resolver<TResolversTypes['Date'], ParentType, ContextType>;
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

export type TVoteResolvers<ContextType = IContext, ParentType extends TResolversParentTypes['Vote'] = TResolversParentTypes['Vote']> = ResolversObject<{
  chartInfo?: Resolver<Maybe<TResolversTypes['String']>, ParentType, ContextType>;
  description?: Resolver<TResolversTypes['String'], ParentType, ContextType>;
  end?: Resolver<TResolversTypes['Date'], ParentType, ContextType>;
  id?: Resolver<TResolversTypes['ID'], ParentType, ContextType>;
  image?: Resolver<TResolversTypes['String'], ParentType, ContextType>;
  items?: Resolver<Array<TResolversTypes['String']>, ParentType, ContextType>;
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

export type TResolvers<ContextType = IContext> = ResolversObject<{
  Author?: TAuthorResolvers<ContextType>;
  Book?: TBookResolvers<ContextType>;
  BorderCrossing?: TBorderCrossingResolvers<ContextType>;
  ChangeTransaction?: TChangeTransactionResolvers<ContextType>;
  CitizenUser?: TCitizenUserResolvers<ContextType>;
  CompanyEmployeeEdge?: TCompanyEmployeeEdgeResolvers<ContextType>;
  CompanyUser?: TCompanyUserResolvers<ContextType>;
  CustomsTransaction?: TCustomsTransactionResolvers<ContextType>;
  Date?: GraphQLScalarType;
  EmploymentContractOffer?: TEmploymentContractOfferResolvers<ContextType>;
  File?: GraphQLScalarType;
  FinancesFragment?: TFinancesFragmentResolvers<ContextType>;
  GuestUser?: TGuestUserResolvers<ContextType>;
  Mutation?: TMutationResolvers<ContextType>;
  Product?: TProductResolvers<ContextType>;
  PurchaseItem?: TPurchaseItemResolvers<ContextType>;
  PurchaseTransaction?: TPurchaseTransactionResolvers<ContextType>;
  Query?: TQueryResolvers<ContextType>;
  SalaryTransaction?: TSalaryTransactionResolvers<ContextType>;
  Session?: TSessionResolvers<ContextType>;
  StatsFragment?: TStatsFragmentResolvers<ContextType>;
  Subscription?: TSubscriptionResolvers<ContextType>;
  Transaction?: TTransactionResolvers<ContextType>;
  TransferTransaction?: TTransferTransactionResolvers<ContextType>;
  User?: TUserResolvers<ContextType>;
  Vote?: TVoteResolvers<ContextType>;
  VoteCitizenEdge?: TVoteCitizenEdgeResolvers<ContextType>;
}>;

export type TDirectiveResolvers<ContextType = IContext> = ResolversObject<{
  auth?: TAuthDirectiveResolver<any, any, ContextType>;
}>;

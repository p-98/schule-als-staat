import { GraphQLYogaError, pipe, filter } from "@graphql-yoga/node";
import type { TResolvers } from "Types/schema";
import type { IAuthorModel, IBookModel, TPayload } from "Types/models";

// datastore mock
const books: IBookModel[] = [
    {
        title: "lol",
        author: "Max 1",
    },
];
const authors: IAuthorModel[] = [
    {
        name: "Max 1",
    },
];

// functions
function getAllBooks(): IBookModel[] {
    return books;
}

function getBooksByAuthor(author: string): IBookModel[] {
    return books.filter((book) => book.author === author);
}

function getBook(title: string): IBookModel | null {
    return books.find((book) => book.title === title) ?? null;
}

function getAllAuthors(): IAuthorModel[] {
    return authors;
}

function getAuthor(name: string): IAuthorModel | null {
    return authors.find((author) => author.name === name) ?? null;
}

function addBook(newBook: IBookModel): IBookModel {
    books.push(newBook);

    if (!authors.find((author) => author.name === newBook.author)) {
        // author doesn't exist yet, so we add him
        authors.push({
            name: newBook.author,
        });
    }

    return newBook;
}

// resolvers
export default {
    Book: {
        author: (source) => {
            const author = getAuthor(source.author);

            if (!author)
                throw new GraphQLYogaError(
                    `Author '${source.author}' not found`,
                    { code: "AUTHOR_NOT_FOUND" }
                );

            return author;
        },
    },
    Author: {
        books: (source) => getBooksByAuthor(source.name),
    },
    Query: {
        books: () => getAllBooks(),
        book: (_, args) => getBook(args.title),
        authors: () => getAllAuthors(),
        author: (_, args) => getAuthor(args.name),
    },
    Mutation: {
        addBook: (_, args, context) => {
            const newBook = addBook(args.input);
            context.pubsub.publish("ADDED_BOOK", newBook);
            return newBook;
        },
    },
    Subscription: {
        addedBook: {
            subscribe: (_, args, context) =>
                pipe(
                    context.pubsub.subscribe("ADDED_BOOK"),
                    filter((book) =>
                        args.author ? args.author === book.author : true
                    )
                ),
            resolve: (payload: TPayload<"ADDED_BOOK">) => payload,
        },
    },
} as TResolvers;

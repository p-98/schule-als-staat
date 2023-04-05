import type { IAuthorModel, IBookModel } from "Types/models";

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
export function getAllBooks(): IBookModel[] {
    return books;
}

export function getBooksByAuthor(author: string): IBookModel[] {
    return books.filter((book) => book.author === author);
}

export function getBook(title: string): IBookModel | null {
    return books.find((book) => book.title === title) ?? null;
}

export function getAllAuthors(): IAuthorModel[] {
    return authors;
}

export function getAuthor(name: string): IAuthorModel | null {
    return authors.find((author) => author.name === name) ?? null;
}

export function addBook(newBook: IBookModel): IBookModel {
    books.push(newBook);

    if (!authors.find((author) => author.name === newBook.author)) {
        // author doesn't exist yet, so we add him
        authors.push({
            name: newBook.author,
        });
    }

    return newBook;
}

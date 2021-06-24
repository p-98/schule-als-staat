import { IAuthorModel, IBookModel } from "@type/models";

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

export default class Library {
    static getAllBooks(): IBookModel[] {
        return books;
    }

    static getBooksByAuthor(author: string): IBookModel[] {
        return books.filter((book) => book.author === author);
    }

    static getBook(title: string): IBookModel | null {
        return books.find((book) => book.title === title) ?? null;
    }

    static getAllAuthors(): IAuthorModel[] {
        return authors;
    }

    static getAuthor(name: string): IAuthorModel | null {
        return authors.find((author) => author.name === name) ?? null;
    }

    static addBook(newBook: IBookModel): IBookModel {
        books.push(newBook);

        if (!authors.find((author) => author.name === newBook.author)) {
            // author doesn't exist yes, so we add it
            authors.push({
                name: newBook.author,
            });
        }

        return newBook;
    }
}

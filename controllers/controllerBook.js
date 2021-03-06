const { Book } = require('../models');
const generateCodeBook = require('../helpers/generateCodeBook.js');
const formatRupiah = require('../helpers/formatRupiah.js');

class ControllerBook {
    static getList(req, res) {
        const is_login = req.session.user_id;
        let limit = (req.query.limit) ? +req.query.limit : 5;
        let offset = 0;

        Book.findAndCountAll()
            .then((data) => {
            let page = req.params.page;
            let pages = Math.ceil(data.count / limit);
            offset = limit * (page - 1);

        Book.findAll({
                limit: limit,
                offset: offset,
                $sort: { id: 1 },
                order: [['title', 'asc']]
            })
            .then((books) => {
                res.render('books/list-book.ejs', { dataBooks: books, generateCodeBook, 'page': page, 'totalPage': pages, 'offset':offset, is_login, formatRupiah, limit })
            })
            })
            .catch(function (error) {
                res.status(500).send('Internal Server Error');
            });
    }

    static postList(req, res) {
        const limit = +req.body.limit;
        const page = req.params.page;
        res.redirect(`/books/${page}?limit=${limit}`)
    }

    static getDelete(req, res) {
        const id = +req.params.id;

        Book.destroy({
                where: { id: id }
            })
            .then(() => res.redirect('/books'))
            .catch((err) => res.send(err.message))
    }

    static getAdd(req, res) {
        const errorValidation = req.query.alert;
        const page = req.params.page; 
        const is_login = req.session.user_id;
        res.render('books/add-book.ejs', { errorValidation, page, is_login });
    }

    static postAdd(req, res) {
        const { title, isbn, published_year, publisher, author, category, rent_price } = req.body;
        const newBook = {
            title, isbn, published_year: +published_year, publisher, author, category, rent_price: +rent_price
        }

        const page = req.params.page; 

        Book.create(newBook)
            .then(() => res.redirect('/books'))
            .catch((err) => {
                const messages = []

                if (err.errors.length > 0) {
                    err.errors.forEach(errorMsg => {
                        messages.push(errorMsg.message)
                    })
                    res.redirect(`/books/${page}/add?alert=${messages}`);
                } else {
                    res.send(err)
                }
            })
    }

    static getEdit(req, res) {
        const id = +req.params.id;
        const errorValidation = req.query.alert;

        Book.findByPk(id)
            .then((foundBook) => {
                res.render('books/edit-book.ejs', { editBook: foundBook, errorValidation })
            })
            .catch(err => res.send(err.message))
    }

    static postEdit(req, res) {
        const id = +req.params.id;
        const { title, isbn, published_year, publisher, author, category, rent_price } = req.body;
        const editedBook = {
            title, isbn, published_year: +published_year, publisher, author, category, rent_price: +rent_price
        }

        Book.update(editedBook, {
                where: { id: id }
            })
            .then(() => res.redirect('/books'))
            .catch((err) => {
                const messages = []

                if (err.errors.length > 0) {
                    err.errors.forEach(errorMsg => {
                        messages.push(errorMsg.message)
                    })
                    res.redirect(`/books/edit/${id}?alert=${messages}`);
                } else {
                    res.send(err.message)
                }
            })
    }
        
}

module.exports = ControllerBook;
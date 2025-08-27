// 현재 수정 중인 도서 ID
let editingBookId = null;

const submitButton = document.querySelector('#submitButton');
const cancelButton = document.querySelector('#cancelButton');
const bookForm = document.querySelector('#bookForm');
const bookList = document.querySelector('#bookList');
const errorMessage = document.querySelector('#errorMessage');

// 서버와 클라이언트의 포트 및 경로를 일치시킵니다.
const apiUrl = 'http://localhost:8081/api/books'; // 또는 8081 등, 서버 포트에 맞게 수정

// 에러 메시지 출력 함수
function displayError(message) {
    errorMessage.textContent = message;
    errorMessage.style.display = 'block';
}

function clearError() {
    errorMessage.textContent = '';
    errorMessage.style.display = 'none';
}

// 폼 초기화 함수
function resetForm() {
    bookForm.reset();
    editingBookId = null;
    submitButton.textContent = '등록';
    clearError();
}

async function createBook(bookData) {
    try {
        const response = await fetch(apiUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(bookData)
        });
        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`도서 등록 실패: ${errorText}`);
        }
        await fetchAndDisplayBooks();
        resetForm();
    } catch (error) {
        console.error('Error creating book:', error);
        displayError(error.message);
    }
}

async function deleteBook(bookId) {
    try {
        const response = await fetch(`${apiUrl}/${bookId}`, {
            method: 'DELETE'
        });
        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`도서 삭제 실패: ${errorText}`);
        }
        await fetchAndDisplayBooks();
    } catch (error) {
        console.error('Error deleting book:', error);
        displayError(error.message);
    }
}

async function editBook(bookId) {
    try {
        const response = await fetch(`${apiUrl}/${bookId}`);
        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`도서 정보 로드 실패: ${errorText}`);
        }
        const book = await response.json();
        
        document.querySelector('#title').value = book.title;
        document.querySelector('#author').value = book.author;
        document.querySelector('#price').value = book.price;
        // 수정: ISBN과 출판일 필드 추가
        document.querySelector('#isbn').value = book.isbn;
        document.querySelector('#publishDate').value = book.publishDate;
        
        editingBookId = bookId;
        submitButton.textContent = '수정';
    } catch (error) {
        console.error('Error editing book:', error);
        displayError(error.message);
    }
}

async function updateBook(bookId, bookData) {
    try {
        const response = await fetch(`${apiUrl}/${bookId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(bookData)
        });
        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`도서 수정 실패: ${errorText}`);
        }
        await fetchAndDisplayBooks();
        resetForm();
    } catch (error) {
        console.error('Error updating book:', error);
        displayError(error.message);
    }
}

async function fetchAndDisplayBooks() {
    try {
        const response = await fetch(apiUrl);
        if (!response.ok) {
            throw new Error('도서 목록을 가져오는 데 실패했습니다.');
        }
        const books = await response.json();
        bookList.innerHTML = '';
        books.forEach(book => {
            const li = document.createElement('li');
            li.innerHTML = `
                <div class="book-info">
                    <strong>${book.title}</strong> by ${book.author} - ₩${book.price} <br>
                    ISBN: ${book.isbn}, 출판일: ${book.publishDate}
                </div>
                <div class="book-actions">
                    <button class="edit-button" data-id="${book.id}">수정</button>
                    <button class="delete-button" data-id="${book.id}">삭제</button>
                </div>
            `;
            bookList.appendChild(li);
        });
    } catch (error) {
        console.error('Error fetching books:', error);
        displayError(error.message);
    }
}

bookForm.addEventListener('submit', (e) => {
    e.preventDefault();
    clearError();

    const title = document.querySelector('#title').value;
    const author = document.querySelector('#author').value;
    const price = parseFloat(document.querySelector('#price').value);
    // 수정: ISBN과 출판일 값 가져오기
    const isbn = document.querySelector('#isbn').value;
    const publishDate = document.querySelector('#publishDate').value;

    const bookData = { title, author, price, isbn, publishDate };

    if (editingBookId) {
        updateBook(editingBookId, bookData);
    } else {
        createBook(bookData);
    }
});

cancelButton.addEventListener('click', () => {
    resetForm();
});

bookList.addEventListener('click', (e) => {
    const target = e.target;
    const bookId = target.dataset.id;

    if (target.classList.contains('delete-button')) {
        if (confirm('정말로 이 도서를 삭제하시겠습니까?')) {
            deleteBook(bookId);
        }
    } else if (target.classList.contains('edit-button')) {
        editBook(bookId);
    }
});

document.addEventListener('DOMContentLoaded', fetchAndDisplayBooks);
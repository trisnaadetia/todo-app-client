const baseUrl = 'https://todo-oo-app.herokuapp.com'


function onSignIn(googleUser) {
    const id_token = googleUser.getAuthResponse().id_token;

    $.ajax({
        method: 'POST',
        url: `${baseUrl}/googleLogin`,
        data: {
            id_token
        }
    })
    .done((response) => {
        localStorage.setItem('access_token', response.access_token)
        showHome()
        showTodo()
        getNews()
        getPrayerTime()
    })
    .fail((error) => {
        console.log(error)
        checkInputData('Check your google account!')
    })

}

function showLogin() {
    $('#form-login').fadeIn()
    $('#form-register').hide()
    $('#todo-list').hide()
    $('#form-add-todo').hide()
    $('#form-edit-todo').hide()
    $('#banner').fadeIn()

    $('#home-page').hide()
    $('#login-page').fadeIn()
    $('#register-page').fadeIn()
    $('#logout').hide()
}

function showRegister() {
    $('#form-login').hide()
    $('#form-register').fadeIn()
    $('#todo-list').hide()
    $('#form-add-todo').hide()
    $('#form-edit-todo').hide()
    $('#banner').fadeIn()

    $('#home-page').hide()
    $('#login-page').fadeIn()
    $('#register-page').fadeIn()
    $('#logout').hide()
}

function showHome() {
    $('#form-login').hide()
    $('#form-register').hide()
    $('#todo-list').fadeIn()
    $('#form-add-todo').hide()
    $('#form-edit-todo').hide()
    $('#banner').hide()

    $('#home-page').fadeIn()
    $('#login-page').hide()
    $('#register-page').hide()
    $('#logout').fadeIn()
}

function showAddForm() {
    $('#form-login').hide()
    $('#form-register').hide()
    $('#todo-list').hide()
    $('#form-add-todo').fadeIn()
    $('#form-edit-todo').hide()
    $('#banner').fadeIn()

    $('#home-page').fadeIn()
    $('#login-page').hide()
    $('#register-page').hide()
    $('#logout').fadeIn()
}

function showEditForm() {
    $('#form-login').hide()
    $('#form-register').hide()
    $('#todo-list').hide()
    $('#form-add-todo').hide()
    $('#form-edit-todo').fadeIn()
    $('#banner').fadeIn()

    $('#home-page').fadeIn()
    $('#login-page').hide()
    $('#register-page').hide()
    $('#logout').fadeIn()
}

function showTodo() {
    $('#append-todo').empty()

    $.ajax({
        method: 'GET',
        url: `${baseUrl}/todos`,
        headers: {
            access_token: localStorage.getItem('access_token')
        }
    })
    .done((response) => {
        if (response.length === 0) {
            $('#title-todo-list').text('Nothing todo :(')
        } else {
            $('#title-todo-list').text('Your todo list')
        }
        response.forEach(element => {
            const { id, title, description, status, due_date } = element
            let convertDate = due_date

            if (status === "Uncompleted") {
                $('#append-todo').append(`
                <div class="d-inline-block card m-4" style="width: 20rem;">
                    <div class="card-body">
                        <h6 class="card-title">Title:</h6>
                        <p class="card-text"><strong>${title}</strong></p>
                        <h6 class="card-title">Description:</h6>
                        <p class="card-text">${description}</p>
                        <h6 class="card-title">Status:</h6>
                        <p class="card-text">${status}</p>
                        <h6 class="card-title">Deadline:</h6>
                        <p class="card-text">${convertDate.substring(0, 10)}</p>
                        <button type="button" class="btn btn-warning" id="edit-${id}">Edit</button>
                        <button type="button" class="btn btn-danger" id="delete-${id}">Delete</button>
                        <a style="text-decoration: none; color: black; font-size: 2rem;" href="#" id="done-${id}"><img src="./img/checklist.png" alt="" style="width: 3rem;"></a>
                    </div>
                </div>
                `)
            } else {
                $('#append-todo').append(`
                <div class="d-inline-block card m-4" style="width: 20rem;">
                    <div class="card-body text-white" style="background-color: #4B0082;">
                        <h6 class="card-title">Title:</h6>
                        <p class="card-text"><strong>${title}</strong></p>
                        <h6 class="card-title">Description:</h6>
                        <p class="card-text">${description}</p>
                        <h6 class="card-title">Status:</h6>
                        <p class="card-text">${status}</p>
                        <h6 class="card-title">Deadline:</h6>
                        <p class="card-text">${convertDate.substring(0, 10)}</p>
                        <button type="button" class="btn btn-warning" id="edit-${id}">Edit</button>
                        <button type="button" class="btn btn-danger" id="delete-${id}">Delete</button>
                    </div>
                </div>
                `)
            }

            deleteTodoById(element.id)
            showUpdateTodoById(element.id, element)
            patchTodoById(element.id)
        })
    })
    .fail((error) => {
        console.log(error)
    })
}

function deleteTodoById(id) {
    $(`#delete-${id}`).on('click', (event) => {
        event.preventDefault()
        Swal.fire({
            title: 'Are you sure?',
            text: "You won't be able to revert this!",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Yes, delete it!'
        }).then((result) => {
            if (result.isConfirmed) {
                Swal.fire(
                'Deleted!',
                'Your todo has been deleted.',
                'success'
                )

                $.ajax({
                    method: 'DELETE',
                    url: `${baseUrl}/todos/${id}`,
                    headers: {
                        access_token: localStorage.getItem('access_token')
                    }
                })
                .done((response) => {
                    showHome()
                    showTodo()
                })
                .fail((error) => {
                    console.log(error)
                })
            }
        })
    })
}

function showUpdateTodoById(id, element) {
    $(`#edit-${id}`).on('click', (event) => {
        event.preventDefault()
        showEditForm()
        let convertDate = element.due_date.substring(0, 10)

        $('#title-todo-edit').val(element.title)
        $('#description-todo-edit').val(element.description)
        $('#status-todo-edit').val(element.status)
        $('#due-date-todo-edit').val(convertDate)

        updateFormEdit(id)        
    })
}


function updateFormEdit(id) {
    $('#form-edit').on('submit', (event) => {
        event.preventDefault()
        const title = $('#title-todo-edit').val()
        const description = $('#description-todo-edit').val()
        const status = $('#status-todo-edit').val()
        const due_date = $('#due-date-todo-edit').val()

        Swal.fire({
            title: 'Do you want to save the changes?',
            showDenyButton: true,
            showCancelButton: true,
            confirmButtonText: `Save`,
            denyButtonText: `Don't save`,
        }).then((result) => {
            if (result.isConfirmed) {
                $.ajax({
                    method: 'PUT',
                    url: `${baseUrl}/todos/${id}`,
                    headers: {
                        access_token: localStorage.getItem('access_token')
                    },
                    data: {
                        title,
                        description,
                        status,
                        due_date
                    }
                })
                .done((response) => {
                    Swal.fire('Saved!', '', 'success')
                    showHome()
                    showTodo()
                })
                .fail((error) => {
                    console.log(error)
                    checkInputData('Check your input data!')
                })
                .always(() => {
                    $('#title-todo-edit').val('')
                    $('#description-todo-edit').val('')
                    $('#status-todo-edit').val('')
                    $('#due-date-todo-edit').val('')
                })
            } else if (result.isDenied) {
                Swal.fire('Changes are not saved', '', 'info')
            }
        })

    })
}

function patchTodoById(id) {
    $(`#done-${id}`).on('click', (event) => {
        event.preventDefault()
        Swal.fire({
            title: 'Are you sure?',
            text: "Have you finish your todo?",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Yes, finish it!'
            }).then((result) => {
                if (result.isConfirmed) {
                    Swal.fire(
                    'Done!',
                    'Your todo has been completed.',
                    'success'
                    )
                    
                    $.ajax({
                        method: 'PATCH',
                        url: `${baseUrl}/todos/${id}`,
                        headers: {
                            access_token: localStorage.getItem('access_token')
                        },
                        data: {
                            status: 'Completed'
                        }
                    })
                    .done((response) => {
                        showHome()
                        showTodo()
                    })
                    .fail((error) => {
                        console.log(error)
                    })
                }
            })
    })
}

function getNews() {
    $('#append-news').empty()

    $.ajax({
        method: 'GET',
        url: `${baseUrl}/news`
    })
    .done((response) => {
        response.forEach((element) => {
            let { source, title, description, url, imageUrl } = element

            $('#append-news').append(`
            <div class="card m-4" style="width: 22rem;">
                <img src="${imageUrl}" class="card-img-top" alt="${source}">
                <div class="card-body">
                    <h5 class="card-title">${title}</h5>
                    <p class="card-text">${description}</p>
                    <a href="${url}" class="card-link">Read More</a>
                </div>
            </div>
            `)
        })
    })
}

function getPrayerTime() {
    $('#append-prayer').empty()

    $.ajax({
        method: 'GET',
        url: `${baseUrl}/prayer`
    })
    .done(response => {
        const prayersTime = response['0'].times
        for(key in prayersTime) {
            $('#append-prayer').append(`
                <tr>
                    <th scope="row">${key}</th>
                    <td>${prayersTime[key]}</td>
                </tr>
            `)
        }
    })
    .fail(error => {
        console.log(error)
    })
}

function checkInputData(message) {
    Swal.fire({
        icon: 'error',
        title: 'Oops...',
        text: message
    })
}


$(document).ready(() => {

    if(localStorage.getItem('access_token')) {
        showHome()
        showTodo()
        getNews()
        getPrayerTime()
    } else {
        showLogin()
    }

    $('#home-page').click(() => {
        showHome()
    })

    $('#register-page').click(() => {
        showRegister()
    })

    $('#login-page').click(() => {
        showLogin()
    })


    $('#logout').click(() => {
        localStorage.clear()

        const auth2 = gapi.auth2.getAuthInstance()
        auth2.signOut()
        .then(() => {
            console.log('User signed out.')
        })
        
        Swal.fire(
            'You are logged out!',
            'See you, dont forget to be productive!',
            'success'
        )

        showLogin()
    })

    $('#add-todo').click(() => {
        showAddForm()
    })

    $('#login').on('submit', (event) => {
        event.preventDefault()
        const email = $('#email-login').val()
        const password = $('#password-login').val()
        
        $.ajax({
            method: 'POST',
            url: `${baseUrl}/login`,
            data: {
                email,
                password
            }
        })
        .done((response) => {
            localStorage.setItem('access_token', response.access_token)
            Swal.fire(
                'You are logged in!',
                `${email}`,
                'success'
            )
            showHome()
            showTodo()
            getNews()
            getPrayerTime()
        })
        .fail((error) => {
            console.log(error)
            checkInputData('Check your input email or password!')
        })
        .always(() => {
            $('#email-login').val('')
            $('#password-login').val('')
        })
    })

    $('#register').on('submit', (event) => {
        event.preventDefault()
        const username = $('#username-register').val()
        const email = $('#email-register').val()
        const password = $('#password-register').val()

        $.ajax({
            method: 'POST',
            url: `${baseUrl}/register`,
            data: {
                username,
                email,
                password
            }
        })
        .done((response) => {
            Swal.fire(
                'Thanks for register!',
                'You can login now!',
                'success'
            )
            showLogin()
        })
        .fail((error) => {
            console.log(error)
            checkInputData('Check your input data!')

        })
        .always(() => {
            $('#username-register').val('')
            $('#email-register').val('')
            $('#password-register').val('')
        })
    })

    $('#form-add').on('submit', (event) => {
        event.preventDefault()
        const title = $('#title-todo').val()
        const description = $('#description-todo').val()
        const due_date = $('#due-date-todo').val()

        $.ajax({
            method: 'POST',
            url: `${baseUrl}/todos`,
            headers: {
                access_token: localStorage.getItem('access_token')
            },
            data: {
                title,
                description,
                due_date
            }
        })
        .done((response) => {
            Swal.fire(
                'Yeay!',
                'Success add todo!',
                'success'
            )
            showHome()
            showTodo()
        })
        .fail((error) => {
            console.log(error)
            checkInputData('Check your input data!')
            
        })
        .always(() => {
            $('#title-todo').val('')
            $('#description-todo').val('')
            $('#due-date-todo').val('')
        })
    })
})
const BASE_URL = 'https://movie-list.alphacamp.io'
const INDEX_URL = BASE_URL + '/api/v1/movies/'
const POSTER_URL = BASE_URL + '/posters/'
const MOVIE_PRE_PAGE = 12

const movies = []
let filteredMovies = []
let viewMode = 'picture-view'

const dataPanel = document.querySelector('#data-panel')
const searchForm = document.querySelector('#search-form')
const searchInput = document.querySelector('#search-input')
const paginator = document.querySelector('#paginator')
const view = document.querySelector('#view')

function renderPaginator (amount) {
  const numberOfPages = Math.ceil(amount / MOVIE_PRE_PAGE)
  let rawHTML = ''
  for (let page = 1; page <= numberOfPages; page++) {
    rawHTML += `<li class="page-item"><a class="page-link" href="#" data-page="${page}">${page}</a></li>`
  }
  paginator.innerHTML = rawHTML
}

function getMoviesByPage (page) {
  const data = filteredMovies.length ? filteredMovies : movies
  const startIndex = (page - 1) * MOVIE_PRE_PAGE
  return data.slice(startIndex, startIndex + MOVIE_PRE_PAGE)
}

// function renderMovieList (data) {
//   let rowHtml = ''
//   data.forEach(item => {
//     rowHtml += `
//     <div class="col-sm-3">
//       <div class="mb-2">
//         <div class="card">
//           <img src="${POSTER_URL + item.image}" class="card-img-top" alt="Movie Poster">
//           <div class="card-body">
//             <h5 class="card-title">${item.title}</h5>
//           </div>
//           <div class="card-footer text-muted">
//             <button class="btn btn-primary btn-show-movie" data-toggle="modal" data-target="#movie-modal" data-id="${item.id}">More</button>
//             <button class="btn btn-info btn-add-favorite" data-id="${item.id}">+</button>
//           </div>
//         </div>
//       </div>
//     </div>`
//   })
//   dataPanel.innerHTML = rowHtml
// }

function renderMovieList (viewMode, data) {
  let rowHtml = ''
  if (viewMode === 'picture-view') {
    data.forEach(item => {
      rowHtml += `
      <div class="col-sm-3">
        <div class="mb-2">
          <div class="card">
            <img src="${POSTER_URL + item.image}" class="card-img-top" alt="Movie Poster">
            <div class="card-body">
              <h5 class="card-title">${item.title}</h5>
            </div>
            <div class="card-footer text-muted">
              <button class="btn btn-primary btn-show-movie" data-toggle="modal" data-target="#movie-modal" data-id="${item.id}">More</button>
              <button class="btn btn-info btn-add-favorite" data-id="${item.id}">+</button>
            </div>
          </div>
        </div>
      </div>`
    })
  } else if (viewMode === 'list-view') {
    rowHtml = '<table class="table"><tbody>'
    data.forEach(item => {
      rowHtml += `        
      <tr>
        <td>
          <h5>${item.title}</h5>
        </td>
        <td>
          <button class="btn btn-primary btn-show-movie mr-1" data-toggle="modal" data-target="#movie-modal" data-id="${item.id}">More</button>
          <button class="btn btn-info btn-add-favorite" data-id="${item.id}">+</button>
        </td>
      </tr>
      `
    })
    rowHtml += '</tbody></table>'
  }
  
  dataPanel.innerHTML = rowHtml
}



function showMovieModal (id) {
  // get elements
  const modalTitle = document.querySelector('#movie-modal-title')
  const modalImage = document.querySelector('#movie-modal-image')
  const modalDate = document.querySelector('#movie-modal-date')
  const modalDescription = document.querySelector('#movie-modal-description')

  // send request to show api
  axios.get(INDEX_URL + id).then((response) => {
    const data = response.data.results

    // insert data into modal ui
    modalTitle.innerText = data.title
    modalDate.innerText = 'Release date: ' + data.release_date
    modalDescription.innerText = data.description
    modalImage.innerHTML = `<img src="${
      POSTER_URL + data.image
    }" alt="movie-poster" class="img-fluid">`
  })
}

function addToFavorite (id) {
  const list = JSON.parse(localStorage.getItem('favoriteMovies')) || []
  const movie = movies.find((movie) => movie.id === id)
  if (list.some((movie) => movie.id === id)) {
    return alert('此電影已經在收藏清單中！')
  }
  list.push(movie)
  localStorage.setItem('favoriteMovies', JSON.stringify(list))
}

dataPanel.addEventListener('click', function onPanelClicked(event) {
  if (event.target.matches('.btn-show-movie')) {
    showMovieModal(event.target.dataset.id)
  } else if (event.target.matches('.btn-add-favorite')) {
    addToFavorite(Number(event.target.dataset.id))
  }
})

searchForm.addEventListener('submit', function onSearchFormSubmitted(event) {
  event.preventDefault()
  const keyword = searchInput.value.trim().toLowerCase()
  

  // if (!keyword.length) {
  //   return alert('Please key in something.')
  // }

  filteredMovies = movies.filter(movie => movie.title.toLowerCase().includes(keyword))

  // for (const movie of movies) {
  //   if (movie.title.toLowerCase().includes(keyword)) {
  //     filteredMovies.push(movie)
  //   }
  // }

  if (filteredMovies.length === 0) {
    return alert('Cannot find movies with keyword: ' + keyword)
  }
  renderPaginator(filteredMovies.length)
  renderMovieList(viewMode, getMoviesByPage(1))
})

view.addEventListener('click', function onViewSwitch(event) {
  viewMode = event.target.id
  renderPaginator(movies.length)
  renderMovieList(viewMode, getMoviesByPage(1))
})

paginator.addEventListener('click', function onPaginatorClicked(event) {
  if (event.target.tagName !== 'A') return
  const page = event.target.dataset.page
  renderMovieList(viewMode, getMoviesByPage(page))
})

axios.get(INDEX_URL)
  .then(function (response) {
    movies.push(...response.data.results)
    renderPaginator(movies.length)
    renderMovieList(viewMode, getMoviesByPage(1))
  })
  .catch((err) => console.log(err))


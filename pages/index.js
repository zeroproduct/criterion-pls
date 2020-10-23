import React, { useState, useEffect } from 'react';
import Head from '../components/head';
import styles from '../styles/Home.module.css';

import cheerio from 'cheerio';

export async function getStaticProps() {
  const res = await fetch('https://films.criterionchannel.com/');
  const text = await res.text();

  const $ = cheerio.load(text);
  let titles = [];
  $('.criterion-channel__tbody > .criterion-channel__tr > .criterion-channel__td--title').each((i, el) => {
    titles[i] = $(el).text().trim();
  });
  let directors = [];
  $('.criterion-channel__tbody > .criterion-channel__tr > .criterion-channel__td--director').each((i, el) => {
    directors[i] = $(el).text().trim();
  });
  let countries = [];
  $('.criterion-channel__tbody > .criterion-channel__tr > .criterion-channel__td--country').each((i, el) => {
    countries[i] = $(el).text().trim();
  });
  let years = [];
  $('.criterion-channel__tbody > .criterion-channel__tr > .criterion-channel__td--year').each((i, el) => {
    years[i] = $(el).text().trim();
  });
  let movieURLs = [];
  $('.criterion-channel__tbody > .criterion-channel__tr').each((i, el) => {
    movieURLs[i] = $(el).attr('data-href');
  });
  let movieImages = [];
  $(
    '.criterion-channel__tbody > .criterion-channel__tr > .criterion-channel__td--img > .criterion-channel__film-img-wrap > .criterion-channel__film-img'
  ).each((i, el) => {
    movieImages[i] = $(el).attr('src');
  });

  return {
    props: {
      movies: {
        titles,
        directors,
        countries,
        years,
        movieURLs,
        movieImages,
      },
    },
  };
}

// Fisher-Yates shuffling algorithm, better than using Math.random()
// https://stackoverflow.com/questions/49555273/how-to-shuffle-an-array-of-objects-in-javascript
const shuffle = (array) =>
  [...Array(array.length)]
    .map((...args) => Math.floor(Math.random() * (args[1] + 1)))
    .reduce((a, rv, i) => ([a[i], a[rv]] = [a[rv], a[i]]) && a, array);

const getRandomMovieIndexes = (movies) => {
  const movieIndexes = [...Array(movies.length).keys()];
  // const shuffled = movieIndexes.sort(() => 0.5 - Math.random());
  const shuffled = shuffle(movieIndexes);
  return shuffled.slice(0, 1);
};

const Home = ({ movies }) => {
  const [randomMoviesIndexes, setRandomMoviesIndexes] = useState([]);
  const [savedMovies, setSavedMovies] = useState([]);

  useEffect(() => {
    setRandomMoviesIndexes(getRandomMovieIndexes(movies.titles));
    const retrievedData = localStorage.getItem('savedMovies');
    if (retrievedData) setSavedMovies(JSON.parse(retrievedData));
  }, []);

  const addToSaved = () => {
    if (!savedMovies.includes(movies.titles[randomMoviesIndexes])) {
      setSavedMovies([...savedMovies, movies.titles[randomMoviesIndexes]]);
      localStorage.setItem('savedMovies', JSON.stringify([...savedMovies, movies.titles[randomMoviesIndexes]]));
    }
  };

  const removeSaved = (movie) => {
    setSavedMovies(savedMovies.filter((savedMovie) => savedMovie !== movie));
    localStorage.setItem('savedMovies', JSON.stringify(savedMovies.filter((savedMovie) => savedMovie !== movie)));
  };

  return (
    <div className={styles.container}>
      <Head title="Criterion Pls" />
      <div className={styles.main}>
        <div className={styles.header}>
          <div className={styles.header__title}>
            <h1>Criterion Pls</h1>
            <span>
              Generate random{' '}
              <a className={styles.header__link} href="https://films.criterionchannel.com/" target="_blank">
                Criterion Channel
              </a>{' '}
              films to watch!
            </span>
          </div>
          <button onClick={() => setRandomMoviesIndexes(getRandomMovieIndexes(movies.titles))}>Randomize</button>
        </div>
        <div className={styles.content}>
          {randomMoviesIndexes.map((randomMovie) => {
            return (
              <div key={randomMovie}>
                <div className={styles.content__image}>
                  <img
                    src={`${
                      movies.movieImages[randomMovie].split('?auto')[0]
                    }?auto=format%2Ccompress&fit=crop&h=720&q=75&w=1280`}
                  />
                </div>
                <div className={styles.content__data}>
                  <h1>
                    <a href={movies.movieURLs[randomMovie]} target="_blank">{movies.titles[randomMovie]} ({movies.years[randomMovie]})</a>
                  </h1>
                  <div className={styles.content__info}>
                    {movies.directors[randomMovie]} — {movies.countries[randomMovie].slice(0, -1)}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
      <div className={styles.saved}>
        <h1>Saved movies</h1>
        <div className={styles.saved__list}>
          <ul>
            {savedMovies ? (
              savedMovies.map((movie) => {
                return (
                  <li key={movie} onClick={() => removeSaved(movie)}>
                    {movie}
                  </li>
                );
              })
            ) : (
              <></>
            )}
          </ul>
          <div className={styles.saved__button}>
            <button onClick={() => addToSaved()}>Add</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;

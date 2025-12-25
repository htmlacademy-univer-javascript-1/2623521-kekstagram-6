// js/api.js

const BASE_URL = 'https://29.javascript.htmlacademy.pro/kekstagram';

const Route = {
  GET_DATA: '/data',
  SEND_DATA: '/',
};

const Method = {
  GET: 'GET',
  POST: 'POST',
};

const checkResponse = (response) => {
  if (!response.ok) {
    throw new Error(`${response.status} ${response.statusText}`);
  }
  return response.json();
};

export const getData = () =>
  fetch(`${BASE_URL}${Route.GET_DATA}`, { method: Method.GET })
    .then(checkResponse);

export const sendData = (formData) =>
  fetch(`${BASE_URL}${Route.SEND_DATA}`, {
    method: Method.POST,
    body: formData,
  }).then(checkResponse);

import { showMessage } from './util.js';
import { fetchData } from './data.js';

// Llamada a las funciones importadas
const data = fetchData();
showMessage("Los datos son: " + data);

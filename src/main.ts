import { mount } from 'svelte';
import './app.css';
import App from './App.svelte';

const target = document.getElementById('app-root');
if (!target) throw new Error('#app-root introuvable');

export default mount(App, { target });

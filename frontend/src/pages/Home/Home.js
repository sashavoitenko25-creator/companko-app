import './Home.css';

import { Header } from '../../components/Header';
import { Map } from '../../components/Map';

export function Home() {
    return `
        <main class="home">
            ${Map()}
            ${Header()}
        </main>
    `;
}
import './Home.css';

import { Header } from '../../components/Header';
import { Map } from '../../components/Map';
import { ActivityBar } from '../../components/ActivityBar';


export function Home(){

    return `

        <main class="home">

            ${Map()}

            ${Header()}

            ${ActivityBar()}

        </main>

    `;

}
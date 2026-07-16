import './Home.css';

import { Header } from '../../components/Header';
import { Map } from '../../components/Map';
import { ActivityBar } from '../../components/ActivityBar';
import { FAB } from '../../components/FAB';


export function Home(){

    return `

        <main class="home">

            ${Map()}

            ${Header()}

            ${ActivityBar()}

            ${FAB()}

        </main>

    `;

}
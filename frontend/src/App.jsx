import { useEffect } from 'react';
import { initRouter } from './router/router';

export default function App() {

    useEffect(() => {
        initRouter();
    }, []);

    return null;

}
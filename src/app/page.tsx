import { Inter } from '@next/font/google';
import Form from '../components/form';
import styles from './page.module.css';

const inter = Inter({ subsets: ['latin'] });

export default function Home() {
	return (
		<div className={styles.container}>
			<Form />
		</div>
	);
}

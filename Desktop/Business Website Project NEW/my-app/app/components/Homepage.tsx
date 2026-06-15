import Header from "./Header/Header";
import Chatwidget from "./Chatwidget/Chatwidget";
import Link from 'next/link';
import styles from './Homepage.module.css';

const categories = [
  { icon: '🔌', title: 'Circuit Boards', description: 'Custom board designs for prototyping and production.' },
  { icon: '💻', title: 'Microchips', description: 'Advanced processors and logic devices for every system.' },
  { icon: '📡', title: 'Sensors', description: 'Precision sensing modules for temperature, motion, and more.' },
  { icon: '🛠️', title: 'Dev Kits', description: 'Complete development kits for fast hardware validation.' },
  { icon: '⚙️', title: 'Custom Solutions', description: 'Tailored electronic solutions built to your requirements.' },
  { icon: '📦', title: 'Bulk Orders', description: 'Scale your inventory with volume pricing and fast fulfillment.' },
];

const values = [
  { icon: '✔️', title: 'Quality Tested', description: 'Every component is verified before it ships to you.' },
  { icon: '🚀', title: 'Fast Shipping', description: 'Worldwide delivery with reliable tracking and support.' },
  { icon: '💬', title: 'Expert Support', description: 'Responsive customer service for orders, returns, and tech help.' },
];

const stats = [
  { value: '10K+', label: 'Active users' },
  { value: '50K+', label: 'Components available' },
  { value: '99%', label: 'Customer satisfaction' },
];

export default function Home() {
  return (
    <main className={styles.homepage}>
      <Header />

      <div className={styles.homepageContent}>
        <section className={styles.section}>
          <div className={styles.sectionHeader}>
            <p className={styles.sectionEyebrow}>Featured categories</p>
            <h2 className={styles.sectionTitle}>Build with the components your next project needs.</h2>
            <p className={styles.sectionSubtitle}>
              Explore our core product groups for makers, engineers, and hardware teams.
              Every category is curated to help you source parts faster and move from prototype to production.
            </p>
          </div>

          <div className={styles.categoryGrid}>
            {categories.map((item) => (
              <article key={item.title} className={styles.categoryCard}>
                <div className={styles.categoryIcon}>{item.icon}</div>
                <h3 className={styles.categoryTitle}>{item.title}</h3>
                <p className={styles.categoryDesc}>{item.description}</p>
              </article>
            ))}
          </div>
        </section>

        <section className={styles.section}>
          <div className={styles.sectionHeader}>
            <p className={styles.sectionEyebrow}>Why choose us</p>
            <h2 className={styles.sectionTitle}>A faster, more reliable way to source electronic components.</h2>
            <p className={styles.sectionSubtitle}>
              We combine verified quality, rapid fulfillment, and expert support so your hardware workflow stays on schedule.
            </p>
          </div>

          <div className={styles.valueGrid}>
            {values.map((item) => (
              <article key={item.title} className={styles.valueCard}>
                <div className={styles.valueIcon}>{item.icon}</div>
                <h3 className={styles.valueTitle}>{item.title}</h3>
                <p className={styles.valueDesc}>{item.description}</p>
              </article>
            ))}
          </div>
        </section>

        <section className={styles.section}>
          <div className={styles.sectionHeader}>
            <p className={styles.sectionEyebrow}>Trusted by engineers</p>
            <h2 className={styles.sectionTitle}>Performance, quality, and support you can count on.</h2>
          </div>

          <div className={styles.statsGrid}>
            {stats.map((item) => (
              <div key={item.label} className={styles.statCard}>
                <p className={styles.statValue}>{item.value}</p>
                <p className={styles.statLabel}>{item.label}</p>
              </div>
            ))}
          </div>
        </section>

        <section className={styles.section}>
          <div className={styles.ctaBanner}>
            <div className={styles.ctaContent}>
              <h2 className={styles.ctaHeading}>Ready for faster sourcing and smarter build support?</h2>
              <p className={styles.ctaText}>Shop inventory, request a quote, or connect with our team for a tailored electronics solution.</p>
            </div>
            <div className={styles.ctaActions}>
              <Link href="/products" className={styles.ctaButton}>Explore Products</Link>
              <Link href="/contact" className={styles.secondaryButton}>Request a Quote</Link>
            </div>
          </div>
        </section>
      </div>

      <Chatwidget />
    </main>
  );
}

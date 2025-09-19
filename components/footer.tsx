import { Rubik } from 'next/font/google'

const rubik = Rubik({ subsets: ['latin'], weight: '400' })

export default function Footer() {
  return (
    <div className="w-full py-2">
      <div className="container mx-auto    px-4 text-center text-xs text-muted-foreground leading-none">
         {" "}
        <a
          href="https://balrok.studio"
          target="_blank"
          rel="noopener noreferrer"
          className={`${rubik.className} no-underline hover:text-foreground`}
        >
          Balrok.Studio
        </a>
      </div>
    </div>
  );
}

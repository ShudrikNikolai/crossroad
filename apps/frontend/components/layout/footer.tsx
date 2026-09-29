import Link from 'next/link';
import Image from 'next/image';
import Github from '../../public/github.svg';
import Gitlab from '../../public/gitlab.svg';
import { GITHUB_URL, GITLAB_URL } from '@/shared/config';

export function Footer() {
  return (
    <footer className="border-t border-default-200 bg-background">
      <div className="mx-auto flex w-full max-w-7xl items-center justify-between px-6 py-4">
        <span className="text-small text-default-500">© {new Date().getFullYear()} Crossroad</span>

        <div className="flex items-center gap-2">
          <Link
            href={GITHUB_URL}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="GitHub"
            className="rounded-medium p-2 text-default-500 transition-colors hover:bg-default-100 hover:text-foreground"
          >
            <Image src={Github} className="logo github" width={20} alt="Github logo" />
          </Link>
          <Link
            href={GITLAB_URL}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="GitLab"
            className="rounded-medium p-2 text-default-500 transition-colors hover:bg-default-100 hover:text-foreground"
          >
            <Image src={Gitlab} className="logo gitlab" width={20} alt="Gitlab logo" />
          </Link>
        </div>
      </div>
    </footer>
  );
}

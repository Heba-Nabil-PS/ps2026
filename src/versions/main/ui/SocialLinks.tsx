import { socials } from "@/lib/site";
import { linkIcons } from "@/versions/main/ui/linkIcons";
import { cn } from "@/lib/utils";

/** PSdigital's social accounts as a row of bare icon links (footer, contact page). */
export function SocialLinks({ className }: { className?: string }) {
  return (
    <ul className={cn("-mx-3 flex flex-wrap items-center", className)}>
      {socials.map((social) => (
        <li key={social.kind}>
          <a
            href={social.href}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={social.label}
            title={social.label}
            className="grid size-11 place-items-center text-muted transition-colors duration-500 hover:text-sky [&_svg]:size-5"
          >
            {linkIcons[social.kind]}
          </a>
        </li>
      ))}
    </ul>
  );
}

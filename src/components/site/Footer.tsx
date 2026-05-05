import { Link } from "react-router-dom";
import logo from "@/assets/brand/logo.png";
import { Phone, Mail, MapPin, Facebook, Instagram, Linkedin } from "lucide-react";
import { EditableText } from "@/components/cms/EditableText";

export function Footer() {
  return (
    <footer className="bg-brand-navy-deep text-white snap-center">
      <div className="container-x grid gap-12 py-16 md:grid-cols-4">
        <div className="md:col-span-2">
          <div className="rounded-sm bg-white p-3 inline-block">
            <img src={logo} alt="Aditya" className="h-10 w-auto" />
          </div>
          <p className="mt-5 max-w-sm text-sm text-white/70">
            <EditableText section="siteFooter" contentKey="aboutText" />
          </p>
          <div className="mt-6 flex gap-3">
            {[Facebook, Instagram, Linkedin].map((Icon, i) => (
              <a
                key={i}
                href="#"
                className="flex h-9 w-9 items-center justify-center rounded-sm border border-white/20 text-white/80 transition-all duration-300 ease-brand hover:scale-110 hover:border-accent hover:bg-accent hover:text-foreground"
              >
                <Icon size={16} />
              </a>
            ))}
          </div>
        </div>

        <div>
          <h4 className="mb-4 font-display text-sm font-bold uppercase tracking-widest text-accent">
            <EditableText section="siteFooter" contentKey="exploreTitle" />
          </h4>
          <ul className="space-y-2 text-sm text-white/80">
            <li><Link to="/" className="hover:text-accent transition-colors">Home</Link></li>
            <li><Link to="/about" className="hover:text-accent transition-colors">About</Link></li>
            <li><Link to="/products" className="hover:text-accent transition-colors">Products</Link></li>
            <li><Link to="/products/silent-62-5" className="hover:text-accent transition-colors">62.5 kVA Showcase</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="mb-4 font-display text-sm font-bold uppercase tracking-widest text-accent">
            <EditableText section="siteFooter" contentKey="contactTitle" />
          </h4>
          <ul className="space-y-3 text-sm text-white/80">
            <li className="flex items-start gap-2">
              <Phone size={14} className="mt-1" /> 
              <EditableText section="siteFooter" contentKey="phone" />
            </li>
            <li className="flex items-start gap-2">
              <Mail size={14} className="mt-1" /> 
              <EditableText section="siteFooter" contentKey="email" />
            </li>
            <li className="flex items-start gap-2">
              <MapPin size={14} className="mt-1" /> 
              <EditableText section="siteFooter" contentKey="address" />
            </li>
          </ul>
        </div>
      </div>
      <div className="container-x flex flex-col gap-2 border-t border-white/10 py-6 text-xs text-white/60 md:flex-row md:items-center md:justify-between">
        <span>© {new Date().getFullYear()} <EditableText section="siteFooter" contentKey="copyrightText" /></span>
        <span><EditableText section="siteFooter" contentKey="certificationText" /></span>
      </div>
    </footer>
  );
}

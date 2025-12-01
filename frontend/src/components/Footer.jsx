import { Link } from 'react-router-dom';
import { FiPackage, FiMail, FiPhone, FiMapPin, FiGithub, FiTwitter, FiInstagram } from 'react-icons/fi';

/**
 * Footer component with links and contact info
 */
const Footer = () => {
  const currentYear = new Date().getFullYear();

  const footerLinks = {
    shop: [
      { to: '/products', label: 'All Products' },
      { to: '/products?size=M', label: 'Men' },
      { to: '/products?size=S', label: 'Women' },
      { to: '/products?priceSort=-1', label: 'Best Sellers' },
    ],
    support: [
      { to: '/faq', label: 'FAQ' },
      { to: '/shipping', label: 'Shipping Info' },
      { to: '/returns', label: 'Returns' },
      { to: '/contact', label: 'Contact Us' },
    ],
    company: [
      { to: '/about', label: 'About Us' },
      { to: '/careers', label: 'Careers' },
      { to: '/privacy', label: 'Privacy Policy' },
      { to: '/terms', label: 'Terms of Service' },
    ],
  };

  const socialLinks = [
    { icon: FiGithub, href: 'https://github.com', label: 'GitHub' },
    { icon: FiTwitter, href: 'https://twitter.com', label: 'Twitter' },
    { icon: FiInstagram, href: 'https://instagram.com', label: 'Instagram' },
  ];

  return (
    <footer className="bg-[var(--color-bg-surface)] mt-auto">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Brand */}
          <div>
            <Link
              to="/"
              className="flex items-center space-x-2 text-xl font-semibold text-[var(--color-primary-variant)] mb-4"
            >
              <FiPackage size={28} />
              <span>ShopCart</span>
            </Link>
            <p className="text-[var(--color-text-secondary)] text-sm mb-4">
              Your one-stop destination for quality fashion and lifestyle products.
            </p>
            <div className="flex space-x-4">
              {socialLinks.map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[var(--color-text-secondary)] hover:text-[var(--color-primary-variant)] transition-colors"
                  aria-label={social.label}
                >
                  <social.icon size={20} />
                </a>
              ))}
            </div>
          </div>

          {/* Shop Links */}
          <div>
            <h3 className="text-[var(--color-text-primary)] font-semibold mb-4">Shop</h3>
            <ul className="space-y-2">
              {footerLinks.shop.map((link) => (
                <li key={link.to}>
                  <Link
                    to={link.to}
                    className="text-[var(--color-text-secondary)] hover:text-[var(--color-primary-variant)] text-sm transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Support Links */}
          <div>
            <h3 className="text-[var(--color-text-primary)] font-semibold mb-4">Support</h3>
            <ul className="space-y-2">
              {footerLinks.support.map((link) => (
                <li key={link.to}>
                  <Link
                    to={link.to}
                    className="text-[var(--color-text-secondary)] hover:text-[var(--color-primary-variant)] text-sm transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="text-[var(--color-text-primary)] font-semibold mb-4">Contact</h3>
            <ul className="space-y-3">
              <li className="flex items-center space-x-3 text-[var(--color-text-secondary)] text-sm">
                <FiMapPin size={16} />
                <span>123 Fashion Street, Mumbai, India</span>
              </li>
              <li className="flex items-center space-x-3 text-[var(--color-text-secondary)] text-sm">
                <FiPhone size={16} />
                <span>+91 98765 43210</span>
              </li>
              <li className="flex items-center space-x-3 text-[var(--color-text-secondary)] text-sm">
                <FiMail size={16} />
                <span>support@shopcart.com</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 pt-8 border-t border-[var(--color-bg-default)]">
          <div className="flex flex-col md:flex-row items-center justify-between space-y-4 md:space-y-0">
            <p className="text-[var(--color-text-secondary)] text-sm">
              © {currentYear} ShopCart. All rights reserved.
            </p>
            <div className="flex space-x-6">
              {footerLinks.company.map((link) => (
                <Link
                  key={link.to}
                  to={link.to}
                  className="text-[var(--color-text-secondary)] hover:text-[var(--color-primary-variant)] text-sm transition-colors"
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

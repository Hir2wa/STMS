import React from 'react';

const Footer = ({ copyrightText, links }) => {
    return (
        <footer className="bg-[#f5e6d3] border-t border-[#d4a574]/30 py-6 mt-auto">
            <div className="container mx-auto px-6 flex flex-col md:flex-row justify-between items-center">
                <div className="text-sm text-[#5a7d6a] font-medium">
                    {copyrightText}
                </div>
                <div className="flex space-x-6 mt-4 md:mt-0">
                    {links && links.map((link, index) => (
                        <a key={index} href={link.url} className="text-[#5a7d6a] hover:text-[#1a3a2f] text-sm transition-colors duration-200">
                            {link.label}
                        </a>
                    ))}
                </div>
            </div>
        </footer>
    );
};

export default Footer;


const fs = require('fs');

let content = fs.readFileSync('src/components/layout/Navbar.tsx', 'utf-8');

const replacement = `          {/* Mobile Menu Button */}
          <button
            className="lg:hidden relative p-2 rounded-lg hover:bg-muted transition-colors"
            onClick={() => setIsOpen(!isOpen)}
            aria-label="Toggle menu"
          >
            <AnimatePresence mode="wait">
              {isOpen ? (
                <motion.div
                  key="close"
                  initial={{ rotate: -90, opacity: 0 }}
                  animate={{ rotate: 0, opacity: 1 }}
                  exit={{ rotate: 90, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <X className="w-6 h-6 text-foreground" />
                </motion.div>
              ) : (
                <motion.div
                  key="menu"
                  initial={{ rotate: 90, opacity: 0 }}
                  animate={{ rotate: 0, opacity: 1 }}
                  exit={{ rotate: -90, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <Menu className="w-6 h-6 text-foreground" />
                </motion.div>
              )}
            </AnimatePresence>
          </button>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
              className="lg:hidden bg-card border-t border-border/30 overflow-hidden"
            >
              <div className="p-4 bg-muted/30 border-b border-border/30">
                <p className="text-sm font-medium text-foreground mb-2">Contact Support</p>
                <div className="flex flex-col gap-2 text-sm">
                  <a href="tel:+911141556447" className="flex items-center gap-2 text-muted-foreground">
                    <Phone className="w-4 h-4" />
                    +91 11 41556447
                  </a>
                  <a href="mailto:info@panyaglobal.in" className="flex items-center gap-2 text-muted-foreground">
                    <Mail className="w-4 h-4" />
                    info@panyaglobal.in
                  </a>
                </div>
              </div>

              {/* Mobile Nav Links */}
              <div className="py-2">
                {navLinks.map((link) =>
                  link.hasDropdown ? (
                    <div key={link.name}>
                      <button
                        onClick={() => setMobileServicesOpen(!mobileServicesOpen)}
                        className="flex items-center justify-between w-full px-4 py-3 font-medium text-foreground hover:bg-primary/5 transition-colors"
                      >
                        {link.name}
                        <ChevronDown
                          className={\`w-4 h-4 transition-transform \${mobileServicesOpen ? "rotate-180" : ""}\`}
                        />
                      </button>

                      <AnimatePresence>
                        {mobileServicesOpen && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.2 }}
                            className="overflow-hidden bg-muted/20"
                          >
                            {megaMenuData.map((category) => (
                              <div key={category.name}>
                                <button
                                  onClick={() =>
                                    setExpandedMobileCategory(
                                      expandedMobileCategory === category.name ? null : category.name,
                                    )
                                  }
                                  className="flex items-center justify-between w-full px-6 py-2.5 text-sm font-medium text-foreground hover:bg-primary/5 transition-colors"
                                >
                                  <div className="flex items-center gap-2">
                                    <category.icon className="w-4 h-4 text-secondary" />
                                    {category.name}
                                  </div>
                                  <ChevronDown
                                    className={\`w-3 h-3 transition-transform \${
                                      expandedMobileCategory === category.name ? "rotate-180" : ""
                                    }\`}
                                  />
                                </button>

                                <AnimatePresence>
                                  {expandedMobileCategory === category.name && (
                                    <motion.div
                                      initial={{ height: 0, opacity: 0 }}
                                      animate={{ height: "auto", opacity: 1 }}
                                      exit={{ height: 0, opacity: 0 }}
                                      transition={{ duration: 0.15 }}
                                      className="overflow-hidden bg-muted/30"
                                    >
                                      {category.services.map((service) => (
                                        <Link
                                          key={service.name}
                                          to={service.href}
                                          className="flex items-center gap-2 px-10 py-2 text-xs text-muted-foreground hover:text-primary transition-colors"
                                        >
                                          <service.icon className="w-3 h-3" />
                                          {service.name}
                                        </Link>
                                      ))}
                                    </motion.div>
                                  )}
                                </AnimatePresence>
                              </div>
                            ))}
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  ) : (
                    <Link
                      key={link.name}
                      to={link.href}
                      className={\`block px-4 py-3 font-medium transition-colors \${
                        location.pathname === link.href
                          ? "text-primary bg-primary/5"
                          : "text-foreground hover:bg-primary/5"
                      }\`}
                    >
                      {link.name}
                    </Link>
                  ),
                )}

                {/* Mobile CTA */}
                <div className="px-4 py-4 border-t border-border/30 mt-2">
                  <Link to="/quote" className="block">
                    <Button className="w-full gap-2 bg-secondary hover:bg-secondary/90 text-secondary-foreground">
                      Get Free Quote
                      <ArrowRight className="w-4 h-4" />
                    </Button>
                  </Link>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.nav>
  );
};

export default Navbar;
`;

const lines = content.split('\\n');
const startIdx = lines.findIndex(line => line.includes('{/* Mobile Menu Button */}'));
if (startIdx !== -1) {
  lines.splice(startIdx, lines.length - startIdx);
  content = lines.join('\\n') + '\\n' + replacement;
  fs.writeFileSync('src/components/layout/Navbar.tsx', content);
  console.log('Successfully fixed Navbar.tsx');
} else {
  console.log('Could not find start index');
}

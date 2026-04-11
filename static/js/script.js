     lucide.createIcons();

        // Mobile menu toggle
        const mobileMenuBtn = document.getElementById('mobileMenuBtn');
        const mobileMenu = document.getElementById('mobileMenu');
        const mobileNavLinks = document.querySelectorAll('.mobile-nav-link');

        mobileMenuBtn.addEventListener('click', () => {
            mobileMenuBtn.classList.toggle('active');
            mobileMenu.classList.toggle('active');
            document.body.style.overflow = mobileMenu.classList.contains('active') ? 'hidden' : '';
        });

        // Close mobile menu when clicking a link
        mobileNavLinks.forEach(link => {
            link.addEventListener('click', () => {
                mobileMenuBtn.classList.remove('active');
                mobileMenu.classList.remove('active');
                document.body.style.overflow = '';
            });
        });

        // Enhanced Scroll animations with IntersectionObserver
        const observerOptions = {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        };

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('visible');
                    
                    // Trigger number counting if it's a stat number
                    if (entry.target.classList.contains('stat-card')) {
                        const numberEl = entry.target.querySelector('.stat-number');
                        if (numberEl && !numberEl.classList.contains('counted')) {
                            animateNumber(numberEl);
                            numberEl.classList.add('counted');
                        }
                    }
                }
            });
        }, observerOptions);

        // Observe all animated elements
        document.querySelectorAll('.fade-in, .fade-in-left, .fade-in-right, .fade-in-scale, .stat-card').forEach(el => observer.observe(el));

        // Number counting animation
        function animateNumber(element) {
            const text = element.textContent;
            const hasDecimal = text.includes('.');
            const hasPlus = text.includes('+');
            const hasB = text.includes('B');
            const hasK = text.includes('K');
            const hasM = text.includes('M');
            
            // Extract numeric value
            let numericValue = parseFloat(text.replace(/[^0-9.]/g, ''));
            if (isNaN(numericValue)) return;
            
            const suffix = hasB ? 'B' : hasM ? 'M' : hasK ? 'K' : '';
            const plus = hasPlus ? '+' : '';
            
            let startTime = null;
            const duration = 2000; // 2 seconds
            
            function step(timestamp) {
                if (!startTime) startTime = timestamp;
                const progress = Math.min((timestamp - startTime) / duration, 1);
                
                // Easing function (ease-out)
                const easeOut = 1 - Math.pow(1 - progress, 3);
                const currentValue = numericValue * easeOut;
                
                // Format the number
                let formatted;
                if (hasDecimal) {
                    formatted = currentValue.toFixed(2);
                } else if (numericValue >= 1000) {
                    formatted = Math.floor(currentValue).toLocaleString();
                } else {
                    formatted = Math.floor(currentValue);
                }
                
                element.textContent = formatted + suffix + plus;
                element.classList.add('counting');
                
                if (progress < 1) {
                    window.requestAnimationFrame(step);
                } else {
                    element.classList.remove('counting');
                }
            }
            
            window.requestAnimationFrame(step);
        }

        // Smooth scroll for nav links
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', function (e) {
                e.preventDefault();
                const target = document.querySelector(this.getAttribute('href'));
                if (target) {
                    target.scrollIntoView({
                        behavior: 'smooth',
                        block: 'start'
                    });
                }
            });
        });

        // Navbar hide/show on scroll direction + background change
        let lastScroll = 0;
        const navbar = document.getElementById('navbar');
        const scrollThreshold = 100;

        window.addEventListener('scroll', () => {
            const currentScroll = window.pageYOffset;
            
            // Background opacity change
            if (currentScroll > scrollThreshold) {
                navbar.style.background = 'rgba(10, 10, 15, 0.98)';
                navbar.style.boxShadow = '0 4px 30px rgba(0, 0, 0, 0.3)';
            } else {
                navbar.style.background = 'rgba(255, 255, 255, 0.05)';
                navbar.style.boxShadow = '0 8px 32px rgba(0, 0, 0, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.08)';
            }

            // Hide/show based on scroll direction
            if (currentScroll > lastScroll && currentScroll > scrollThreshold) {
                // Scrolling down - hide navbar
                navbar.classList.add('hidden');
                navbar.classList.remove('visible');
            } else {
                // Scrolling up - show navbar
                navbar.classList.remove('hidden');
                navbar.classList.add('visible');
            }

            lastScroll = currentScroll;
        });

        // Update active nav link on scroll
        const sections = document.querySelectorAll('section[id]');
        const navLinks = document.querySelectorAll('.nav-link, .mobile-nav-link');

        window.addEventListener('scroll', () => {
            let current = '';

            sections.forEach(section => {
                const sectionTop = section.offsetTop;
                const sectionHeight = section.clientHeight;
                if (scrollY >= sectionTop - 200) {
                    current = section.getAttribute('id');
                }
            });

            navLinks.forEach(link => {
                link.classList.remove('active');
                if (link.getAttribute('href') === '#' + current) {
                    link.classList.add('active');
                }
            });
        });

        // Add parallax effect to orbs
        document.addEventListener('mousemove', (e) => {
            const orbs = document.querySelectorAll('.orb');
            const x = e.clientX / window.innerWidth;
            const y = e.clientY / window.innerHeight;
            
            orbs.forEach((orb, index) => {
                const speed = (index + 1) * 15;
                const xOffset = (x - 0.5) * speed;
                const yOffset = (y - 0.5) * speed;
                orb.style.transform = `translate(${xOffset}px, ${yOffset}px)`;
            });
        });

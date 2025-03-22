import { Component, OnInit, OnDestroy, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { Subscription } from 'rxjs';
import { Store } from '@ngrx/store';
import {User} from '../../../models/user';
import {selectCurrentUser} from '../../../store/user/user.selectors';


interface SidebarLink {
  icon: string;
  label: string;
  route: string;
  badge?: {
    text: string;
    type: 'green' | 'blue';
  };
  roles?: string[]; // Roles allowed to see this link
}

interface SidebarCategory {
  name: string;
  links: SidebarLink[];
  roles?: string[]; // Roles allowed to see this category
}

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './sidebar.component.html',
})
export class SidebarComponent implements OnInit, OnDestroy {
  isDrawerOpen = signal<boolean>(true);
  isMobile = false;
  isCompletelyHidden = false;
  currentUser: User | null = null;
  userRoles: string[] = [];

  private breakpointSubscription: Subscription | null = null;
  private userSubscription: Subscription | null = null;

  // Track open/closed state of each category
  openCategories: {[key: string]: boolean} = {};

  // Define all possible categories and links
  allCategories: SidebarCategory[] = [
    {
      name: 'MAIN',
      links: [
        { icon: 'dashboard', label: 'Dashboard', route: '/dashboard' },
        {
          icon: 'store',
          label: 'Marketplace',
          route: '/marketplace',
          badge: { text: 'New', type: 'green' }
        },
        { icon: 'inventory', label: 'Materials', route: '/materials' },
        {
          icon: 'shopping-cart',
          label: 'Orders',
          route: '/orders',
          badge: { text: '3', type: 'blue' }
        }
      ]
    },
    {
      name: 'ADMIN',
      roles: ['ADMIN'],
      links: [
        { icon: 'building', label: 'Enterprises', route: '/admin/enterprises', roles: ['ADMIN'] },
        { icon: 'category', label: 'Categories', route: '/admin/categories', roles: ['ADMIN'] },
        { icon: 'cities', label: 'Cities', route: '/admin/cities', roles: ['ADMIN'] }
      ]
    },
    {
      name: 'MANAGER',
      roles: ['MANAGER'],
      links: [
        { icon: 'location', label: 'Locations', route: '/manager/locations', roles: ['MANAGER'] },
        { icon: 'building', label: 'Enterprise Details', route: '/manager/enterprise-details', roles: ['MANAGER'] },
        { icon: 'building', label: 'Enterprise Form', route: '/manager/enterprise-form', roles: ['MANAGER'] },
        { icon: 'inventory', label: 'Materials', route: '/manager/materials', roles: ['MANAGER'] }
      ]
    },
    {
      name: 'USER',
      links: [
        { icon: 'building', label: 'Enterprise Details', route: '/manager/enterprise-details' },
        { icon: 'building', label: 'Enterprise Form', route: '/manager/enterprise-form' },
        { icon: 'transactions', label: 'Transactions', route: '/transactions' }
      ]
    }
  ];

  // Filtered categories based on user roles
  categories: SidebarCategory[] = [];

  constructor(
    private breakpointObserver: BreakpointObserver,
    private store: Store
  ) {}

  ngOnInit() {
    // Subscribe to user state
    this.userSubscription = this.store.select(selectCurrentUser).subscribe(user => {
      this.currentUser = user;
      this.userRoles = user?.roles || [];
      this.filterCategoriesByRole();
    });

    // Open first category by default
    if (this.categories.length > 0) {
      this.openCategories[this.categories[0].name] = true;
    }

    // Load saved sidebar states
    const savedState = localStorage.getItem('sidebarOpen');
    this.isDrawerOpen.set(savedState ? savedState === 'true' : true);

    const savedHiddenState = localStorage.getItem('sidebarCompletelyHidden');
    this.isCompletelyHidden = savedHiddenState ? savedHiddenState === 'true' : false;

    // Try to load saved category states
    try {
      const savedCategoryStates = localStorage.getItem('sidebarCategoryStates');
      if (savedCategoryStates) {
        this.openCategories = JSON.parse(savedCategoryStates);
      }
    } catch (e) {
      console.error('Error loading saved category states', e);
    }

    // Listen for screen size changes
    this.breakpointSubscription = this.breakpointObserver
      .observe([Breakpoints.HandsetPortrait, Breakpoints.TabletPortrait])
      .subscribe(result => {
        this.isMobile = result.matches;
        // Auto-close drawer on mobile when first detected
        if (this.isMobile && !localStorage.getItem('sidebarMobileState')) {
          this.isDrawerOpen.set(false);
        }
      });
  }

  filterCategoriesByRole() {
    // Filter categories based on user roles
    this.categories = this.allCategories
      .filter(category => {
        // If no roles specified for the category, show it to everyone
        if (!category.roles) return true;

        // Otherwise, check if user has at least one of the required roles
        return this.hasAnyRole(category.roles);
      })
      .map(category => {
        // For each category, filter its links based on user roles
        return {
          ...category,
          links: category.links.filter(link => {
            // If no roles specified for the link, show it to everyone
            if (!link.roles) return true;

            // Otherwise, check if user has at least one of the required roles
            return this.hasAnyRole(link.roles);
          })
        };
      })
      // Only keep categories that have at least one link
      .filter(category => category.links.length > 0);
  }

  hasAnyRole(requiredRoles: string[]): boolean {
    // Check if the user has any of the required roles
    if (!this.userRoles || this.userRoles.length === 0) return false;
    return requiredRoles.some(role => this.userRoles.includes(role));
  }

  ngOnDestroy(): void {
    if (this.breakpointSubscription) {
      this.breakpointSubscription.unsubscribe();
    }
    if (this.userSubscription) {
      this.userSubscription.unsubscribe();
    }
  }

  toggleDrawer() {
    this.isDrawerOpen.update(isOpen => !isOpen);

    if (this.isMobile) {
      localStorage.setItem('sidebarMobileState', this.isDrawerOpen().toString());
    } else {
      localStorage.setItem('sidebarOpen', this.isDrawerOpen().toString());
    }
  }

  toggleCompletelyHidden() {
    this.isCompletelyHidden = !this.isCompletelyHidden;
    localStorage.setItem('sidebarCompletelyHidden', this.isCompletelyHidden.toString());

    if (this.isCompletelyHidden) {
      this.isDrawerOpen.set(false);
    }
  }

  toggleCategory(categoryName: string) {
    this.openCategories[categoryName] = !this.isCategoryOpen(categoryName);
    this.saveCategoryStates();
  }

  isCategoryOpen(categoryName: string): boolean {
    return this.openCategories[categoryName] === true;
  }

  saveCategoryStates() {
    localStorage.setItem('sidebarCategoryStates', JSON.stringify(this.openCategories));
  }

  getIconPath(icon: string): string {
    const paths: { [key: string]: string } = {
      'dashboard': 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6',
      'store': 'M3 3h18v2H3zm0 8h18m-18 8h18M3 6h18v5a3 3 0 01-3 3H6a3 3 0 01-3-3z',
      'inventory': 'M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4',
      'shopping-cart': 'M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z',
      'building': 'M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4',
      'location': 'M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z M15 11a3 3 0 11-6 0 3 3 0 016 0z',
      'category': 'M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01',
      'transactions': 'M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4',
      'cities': 'M12 2a10 10 0 100 20 10 10 0 000-20z M12 6a6 6 0 100 12 6 6 0 000-12z M12 10a2 2 0 100 4 2 2 0 000-4z',
    };

    return paths[icon] || '';
  }
}

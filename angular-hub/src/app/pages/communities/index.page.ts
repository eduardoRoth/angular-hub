import { Component, computed, Input, signal } from '@angular/core';
import { CommunityCardComponent } from '../../components/cards/community-card.component';
import { toSignal } from '@angular/core/rxjs-interop';
import { injectLoad, RouteMeta } from '@analogjs/router';
import { HeaderService } from '../../services/header.service';
import { load } from './index.server';
import { DropdownModule } from 'primeng/dropdown';
import { FormsModule } from '@angular/forms';

export const routeMeta: RouteMeta = {
  title: 'ANGULAR HUB - Curated list of Angular communities',
  meta: [
    {
      name: 'description',
      content: 'Curated list of Angular communities',
    },
  ],
  data: {
    header: 'Communities',
  },
};

@Component({
  selector: 'app-communities',
  standalone: true,
  imports: [CommunityCardComponent, DropdownModule, FormsModule],
  template: `
    <aside
      class="h-36 w-full flex flex-col justify-center items-center mb-8 bg-no-repeat bg-auto md:bg-cover px-4"
      style="background-image: url(/assets/images/img.png);"
    >
      <h1 class="title text-5xl">ANGULAR HUB</h1>
      <h2 class="text-2xl text-center">Curated list of Angular Communities</h2>
    </aside>

    <form
      class="w-full flex flex-col sm:flex-row justify-center items-center gap-2 mb-8"
    >
      <p-dropdown
        name="language"
        [options]="countries()"
        [style]="{ width: '230px' }"
        [showClear]="true"
        placeholder="Select a country"
        [ngModel]="selectedCountry()"
        (ngModelChange)="selectedCountry.set($event)"
      />
    </form>

    <ul class="flex flex-wrap justify-center gap-x-8 gap-y-4 px-8">
      @for (community of filteredCommunities(); track community.name) {
        <li>
          <app-community-card [community]="community"></app-community-card>
        </li>
      }
    </ul>
  `,
  styles: ``,
})
export default class CommunitiesComponent {
  communities = toSignal(injectLoad<typeof load>(), { requireSync: true });
  selectedCountry = signal(null);
  countries = computed(() =>
    this.communities()
      .map((community) => community.location)
      .reduce<string[]>((acc, curr) => {
        const location = curr
          ? curr.includes(',')
            ? curr.split(',').at(-1)
            : curr
          : '';
        if (location && !acc.includes(location.trim())) {
          acc.push(location.trim());
        }
        return acc;
      }, [])
      .sort((a, b) =>
        a.toLocaleUpperCase().localeCompare(b.toLocaleUpperCase()),
      ),
  );

  filteredCommunities = computed(() =>
    this.communities().filter((community) =>
      this.selectedCountry()
        ? community.location?.includes(this.selectedCountry() ?? '')
        : true,
    ),
  );

  @Input() set header(header: string) {
    this.headerService.setHeaderTitle(header);
  }

  constructor(private readonly headerService: HeaderService) {}
}

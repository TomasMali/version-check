import { CommonModule, DatePipe } from '@angular/common';
import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { DataService } from '../data.service';
import { Release } from '../release.model';

@Component({
  selector: 'app-app-fiscality',
  standalone: true,
  imports: [FormsModule, CommonModule ],
  templateUrl: './app-fiscality.component.html',
  styleUrl: './app-fiscality.component.css'
})
export class AppFiscalityComponent implements OnInit{

  title = 'repo-fis';

  data: any[] = [];
  originalData: any[] = [];
  allSelected: boolean = false;
  selectedRemoteVersion: string = ''; 
  releases: Release[] = [];
  filteredReleases: Release[] = []; 


  selectAllCheckboxState: 'checked' | 'indeterminate' | '' = '';



  constructor(
    private dataService: DataService,
    private changeDetectorRef: ChangeDetectorRef,
 
  ) {}
  
  ngOnInit(): void {
    this.loadReleases();
    this.loadData();
  }

  loadData(): void {
    this.dataService.getData().subscribe((result) => {
      this.data = result;
      this.originalData = this.data

      this.filterData();
    });
  }

  onRemoteVersionChange(selectedValue: string): void {
    this.data =  this.originalData 
    this.filterData();
  }

  filterData(): void {
    // Filter data based on the selectedRemoteVersion

    this.data = this.data.filter(
      (item) =>
        !this.selectedRemoteVersion ||
        this.compareVersions(item.remoteversion + '', this.selectedRemoteVersion) < 0
    );
  }

    // Custom version comparison function
    compareVersions(versionA: string, versionB: string): number {
      const partsA = versionA.split('.').map(Number);
      const partsB = versionB.split('.').map(Number);
  
      for (let i = 0; i < 3; i++) {
        if (partsA[i] > partsB[i]) return 1;
        if (partsA[i] < partsB[i]) return -1;
      }
  
      return 0;
    }


  loadReleases(): void {
    this.dataService.getReleases().subscribe((result) => {
      this.releases = result;

    // Set selectedRemoteVersion to the version number of the last release
    if (this.releases.length > 0) {
      this.selectedRemoteVersion = this.releases[this.releases.length - 1].version_number;
      this.filterData(); // Filter the releases initially

    }

    });
  }

  addRelease(newRelease: Release): void {
    this.dataService.addRelease(newRelease).subscribe((result) => {
      this.loadReleases(); // Refresh the list after adding
    });
  }

  updateRelease(updatedRelease: Release): void {
    this.dataService.updateRelease(updatedRelease).subscribe((result) => {
      this.loadReleases(); // Refresh the list after updating
    });
  }

  deleteRelease(id: number): void {
    this.dataService.deleteRelease(id).subscribe((result) => {
      this.loadReleases(); // Refresh the list after deleting
    });
  }



  updateSelectedVersions(version: string): void {
    this.data.forEach((item) => {
      if (item.selected) {
        item.selectedVersion = version;
      }
    });
  }



  toggleAllSelection(): void {
    this.allSelected = !this.allSelected;
    this.data.forEach((item) => (item.selected = this.allSelected));

    // Update the state of the "All" checkbox
    this.updateSelectAllCheckboxState();

    // Manually trigger change detection
    this.changeDetectorRef.detectChanges();
  }

  updateSelectAllCheckboxState(): void {
    if (this.data.every((item) => item.selected)) {
      this.selectAllCheckboxState = 'checked';
    } else if (this.data.some((item) => item.selected)) {
      this.selectAllCheckboxState = 'indeterminate';
    } else {
      this.selectAllCheckboxState = '';
    }
  }


  saveSelectedVersions(): void {
    const selectedVersions = this.data
      .filter((item) => item.selected)
      .map((item) => ({
        PIVA: item.piva, 
        newRemoteVersion: this.selectedRemoteVersion,
        license: item.licenza,
        os: item.os
      }));
  
     console.log(selectedVersions);
  
    this.dataService.updateRemoteVersions(selectedVersions).subscribe(() => {
      // If the update is successful, refresh the data
      this.loadData();
      this.updateSelectAllCheckboxState();
      // Optionally, you can display a success message or perform other actions
    });
  }
  
  

  isAnyCheckboxSelected(): boolean {
    return this.data.some((item) => item.selected);
  }


}
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { VideoService, Video } from '../../services/video.service';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-content-upload',
  templateUrl: './content-upload.component.html',
  styleUrls: ['./content-upload.component.scss'],
  imports: [CommonModule]
})
export class ContentUploadComponent implements OnInit {

  videos$: Observable<Video[]> | undefined;
  videos: Video[] = [];
  loading = true;
  error: string | null = null;

  constructor(private videoService: VideoService) {}

  ngOnInit(): void {
    console.log('ContentUploadComponent initialized');
    this.loadVideos();
  }

  loadVideos(): void {
    console.log('Loading videos...');
    this.loading = true;
    this.error = null;
    
    this.videos$ = this.videoService.getVideos();
    this.videos$.subscribe({
      next: (data) => {
        console.log('Videos loaded successfully:', data);
        this.videos = data;
        this.loading = false;
        
        if (data.length === 0) {
          console.warn('No videos found in database');
          this.error = 'No videos found. Please upload some videos.';
        }
      },
      error: (error) => {
        console.error('Error loading videos:', error);
        this.error = error.message || 'Failed to load videos. Please check your Firebase connection.';
        this.loading = false;
      }
    });
  }

  getFormattedDate(timestamp: any): string {
    if (!timestamp) {
      return 'N/A';
    }
    
    try {
      let date: Date;
      
      // Handle Firebase Timestamp
      if (timestamp.toDate) {
        date = timestamp.toDate();
      }
      // Handle regular Date object
      else if (timestamp instanceof Date) {
        date = timestamp;
      }
      // Handle timestamp object with seconds/nanoseconds
      else if (timestamp.seconds) {
        date = new Date(timestamp.seconds * 1000);
      } else {
        return 'N/A';
      }
      
      // Format date as dd/MM/yyyy
      const day = String(date.getDate()).padStart(2, '0');
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const year = date.getFullYear();
      
      return `${day}/${month}/${year}`;
    } catch (error) {
      console.error('Error formatting date:', error);
      return 'N/A';
    }
  }

  editVideo(video: Video): void {
    console.log('Edit video:', video);
    // TODO: Implement edit functionality
  }

  deleteVideo(video: Video): void {
    if (!video.id) {
      console.error('Video ID is required for deletion');
      return;
    }
    
    if (confirm('Are you sure you want to delete this video?')) {
      this.videoService.deleteVideo(video.id).then(() => {
        console.log('Video deleted successfully');
        this.loadVideos(); // Refresh the list
      }).catch((error) => {
        console.error('Error deleting video:', error);
        this.error = 'Failed to delete video';
      });
    }
  }
}

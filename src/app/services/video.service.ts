import { Injectable } from '@angular/core';
import { Firestore, collection, collectionData, addDoc, doc, updateDoc, deleteDoc } from '@angular/fire/firestore';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { inject } from '@angular/core';

export interface Video {
  id?: string;
  title: string;
  description: string;
  url: string;
  createdAt: Date;
  updatedAt: Date;
  // Additional properties from Firebase data
  size?: string;
  tagUsed?: string;
  tags?: string;
  duration?: string;
  status?: string;
  converted?: boolean;
  uploadedDate?: any; // Firebase Timestamp
}

@Injectable({
  providedIn: 'root'
})
export class VideoService {

  constructor(private firestore: Firestore) {}

  /**
   * Get all videos from Firestore
   */
  getVideos(): Observable<Video[]> {
    try {
      const videosRef = collection(this.firestore, 'videos');
      return collectionData(videosRef, { idField: 'id' }).pipe(
        map((data: any[]) => {
          console.log('Raw Firebase data:', data);
          return data.map(item => this.transformFirebaseData(item));
        }),
        catchError(error => {
          console.error('Error fetching videos:', error);
          return throwError(() => new Error('Failed to fetch videos'));
        })
      );
    } catch (error) {
      console.error('Error initializing Firestore collection:', error);
      return throwError(() => new Error('Firestore initialization failed'));
    }
  }

  /**
   * Transform Firebase data to Video interface
   */
  private transformFirebaseData(data: any): Video {
    const transformed: Video = {
      id: data.id,
      title: data.title || 'Untitled',
      description: data.description || '',
      url: data.url || '',
      createdAt: data.createdAt?.toDate ? data.createdAt.toDate() : new Date(data.createdAt),
      updatedAt: data.updatedAt?.toDate ? data.updatedAt.toDate() : new Date(data.updatedAt),
      size: data.size,
      tagUsed: data.tagUsed,
      tags: data.tags,
      duration: data.duration,
      status: data.status || 'Public',
      converted: data.converted || false,
      uploadedDate: data.uploadedDate
    };
    
    console.log('Transformed video data:', transformed);
    return transformed;
  }

  /**
   * Add a new video to Firestore
   */
  addVideo(video: Omit<Video, 'id' | 'createdAt' | 'updatedAt'>): Promise<any> {
    try {
      const videosRef = collection(this.firestore, 'videos');
      const videoData = {
        ...video,
        createdAt: new Date(),
        updatedAt: new Date()
      };
      return addDoc(videosRef, videoData);
    } catch (error) {
      console.error('Error adding video:', error);
      throw new Error('Failed to add video');
    }
  }

  /**
   * Update an existing video in Firestore
   */
  updateVideo(id: string, video: Partial<Video>): Promise<void> {
    try {
      const videoRef = doc(this.firestore, `videos/${id}`);
      return updateDoc(videoRef, {
        ...video,
        updatedAt: new Date()
      });
    } catch (error) {
      console.error('Error updating video:', error);
      throw new Error('Failed to update video');
    }
  }

  /**
   * Delete a video from Firestore
   */
  deleteVideo(id: string): Promise<void> {
    try {
      const videoRef = doc(this.firestore, `videos/${id}`);
      return deleteDoc(videoRef);
    } catch (error) {
      console.error('Error deleting video:', error);
      throw new Error('Failed to delete video');
    }
  }
}

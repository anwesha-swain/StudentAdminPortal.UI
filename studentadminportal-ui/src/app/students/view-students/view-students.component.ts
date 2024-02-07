import { Component, OnInit, ViewChild } from '@angular/core';
import { StudentService } from '../student.service';
import { ActivatedRoute, Router } from '@angular/router';
import { Student } from '../../models/ui-models/student.model';
import { GenderService } from '../../services/gender.service';
import { Gender } from '../../models/ui-models/gender.model';
import { MatSnackBar } from '@angular/material/snack-bar';
import { NgForm } from '@angular/forms';

@Component({
  selector: 'app-view-students',
  templateUrl: './view-students.component.html',
  styleUrl: './view-students.component.css'
})
export class ViewStudentsComponent implements OnInit {
  studentId: string | null | undefined;
  student: Student = {
    id: '',
    firstName: '',
    lastName: '',
    dateOfBirth: '',
    email: '',
    mobile: 0,
    genderId: '',
    profileImageUrl: '',
    gender: {
      id: '',
      description: ''
    },
    address: {
      id: '',
      physicalAddress: '',
      postalAddress: ''
    }
  }
  isNewStudent = false;
  header = '';
  displayProfileImageUrl = '';

  genderList: Gender[] = [];
  @ViewChild('studentDetailsForm') studentDetailsForm?: NgForm;

  constructor(private readonly studentService: StudentService, private readonly route: ActivatedRoute,
    private readonly genderService: GenderService, private snackBar: MatSnackBar, private router: Router) {}

  ngOnInit(): void {
    this.route.paramMap.subscribe(
      (params) => {
        this.studentId = params.get('id');

        if(this.studentId) {
          if(this.studentId.toLowerCase() === 'Add'.toLowerCase()) {
            // new student functionality
            this.isNewStudent = true;
            this.header = 'Add new student';
            this.setImage();
          }
          else {
            // existing student functionality
            this.isNewStudent = false;
            this.header = 'Edit student';
            this.studentService.getStudentById(this.studentId)
            .subscribe(
              (successResponse) => {
                this.student = successResponse;
                this.setImage();
              },
              (errorResponse) => {
                this.setImage();
              }
            );
          }

          this.genderService.getGenderList()
          .subscribe(
            (successResponse) => {
              this.genderList = successResponse;
            }
          );
        }
      }
    );
  }

  onUpdate(): void {
    if(this.studentDetailsForm?.form.valid) {
      //call student service to update student
    this.studentService.updateStudent(this.student.id, this.student)
    .subscribe(
      (successResponse) => {
        //show a notification
        this.snackBar.open('Student updated successfully', undefined, { duration: 2000 });
      },
      (errorResponse) => {
        //log it
        console.log(errorResponse);
      }
    );
    }
  }

  onDelete(): void {
    //call student service to delete the student
    this.studentService.deleteStudent(this.student.id)
    .subscribe(
      (successResponse) => {
        this.snackBar.open('Student deleted successfully', undefined, { duration: 2000 });

        setTimeout(() => {
          this.router.navigateByUrl('students');
        }, 2000);
      },
      (errorResponse) => {
        //log
        console.log(errorResponse);
      }
    );
  }

  onAdd(): void {
    if(this.studentDetailsForm?.form.valid) {
      //submit form to api
      this.studentService.addStudent(this.student)
    .subscribe(
      (successResponse) => {
        this.snackBar.open('Student added successfully', undefined, { duration: 2000 });

        setTimeout(() => {
          this.router.navigateByUrl(`students/${successResponse.id}`);
        }, 2000);
      },
      (errorResponse) => {
        //log
        console.log(errorResponse);
      }
    );
    }
  }

  uploadImage(event: any): void {
    if(this.studentId) {
      const file: File = event.target.files[0];
      this.studentService.uploadImage(this.student.id, file)
      .subscribe(
        (successResponse) => {
          this.student.profileImageUrl = successResponse;
          this.setImage();

          //show notification
          this.snackBar.open('Profile image updated', undefined, {
            duration: 2000
          });
        },
        (errorResponse) => {

        }
      );
    }
  }

  private setImage(): void {
    if(this.student.profileImageUrl) {
      //fetch the image by url
      this.displayProfileImageUrl = this.studentService.getImagePath(this.student.profileImageUrl);
    }
    else {
      //display a default
      this.displayProfileImageUrl = '/assets/user.jfif';
    }
  }

}

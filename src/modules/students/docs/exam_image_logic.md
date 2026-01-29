# Exam Logic Analysis: Image Uploads & Manual Grading

Based on the API endpoints provided, here is the deep analysis of the exam workflow specifically for handling image answers and manual grading.

## 1. The Workflow Overview

The system processes exams in two distinct phases: **Submission** (Student) and **Grading** (System/Teacher). Because image answers cannot be auto-graded, the workflow involves a specific sequence of API calls.

### Phase 1: Student Submission Flow
Since the `student-answers/image` endpoint requires a `StudentExamResultId`, the student cannot upload images *before* submitting the exam. The exam record must exist first.

**Step-by-Step Logic:**
1.  **Submit Text/MCQ**: The frontend sends the main exam structure (IDs, text answers, selected options) to `/exams/submit`.
    *   *Result*: The backend creates the `StudentExamResult` record and returns its `id`.
2.  **Upload Images (Parallel)**: Using the returned `StudentExamResultId`, the frontend iterates through every question where the student provided an image.
    *   *Action*: Call `/student-answers/image` for each image.
    *   *Payload*: Links the image to the specific `QuestionId` and the `StudentExamResultId`.

### Phase 2: Grading Flow
Once the admission is complete:
1.  **Auto-Grading**: The system likely grades MCQ/TrueFalse questions immediately upon submission.
2.  **Manual Grading**: The teacher views the exam results. They will see the images uploaded in Phase 1.
3.  **Submit Grades**: The teacher provides a score and feedback for these specific questions using `/exams/grade`.

---

## 2. Technical Implementation Details

### Updated Service Methods
I have updated `StudentService` to support this flow:

```typescript
// 1. Submit the exam structure first using 'any' to capture the ID from the response
submitExam: async (data: SubmitExamRequest): Promise<ApiResponse<any>> => {
    const response = await apiClient.post<ApiResponse<any>>("/exams/submit", data);
    return response.data; // response.data.data should contain the StudentExamResultId
},

// 2. Then upload images using the ID obtained above
uploadStudentAnswerImage: async (
    examId: number,
    studentId: number,
    questionId: number,
    studentExamResultId: number,
    file: File
): Promise<ApiResponse<string>> => {
    const formData = new FormData();
    formData.append("ExamId", examId.toString());
    formData.append("StudentId", studentId.toString());
    formData.append("QuestionId", questionId.toString());
    formData.append("StudentExamResultId", studentExamResultId.toString());
    formData.append("ImageFile", file);

    const response = await apiClient.post<ApiResponse<string>>(
        "/student-answers/image",
        formData,
        { headers: { "Content-Type": "multipart/form-data" } }
    );
    return response.data;
}
```

### Frontend Logic (Concept)

```typescript
const handleSubmit = async () => {
    // 1. Submit main exam
    const result = await StudentService.submitExam(examPayload);
    
    if (result.succeeded) {
        const resultId = result.data; // Assuming ID is directly in data
        
        // 2. Upload images if any exist
        const imageUploads = answers
            .filter(a => a.file)
            .map(a => StudentService.uploadStudentAnswerImage(
                exam.id, 
                studentId, 
                a.questionId, 
                resultId, 
                a.file
            ));
            
        await Promise.all(imageUploads);
        
        // 3. Show success message
    }
}
```

## 3. Teacher Grading Component Structure
For the `/exams/grade` endpoint, you will need a component accessible to the teacher that:
1.  Fetches the student's exam result (which now includes the uploaded images).
2.  Displays the image for manual verification.
3.  Provides an input field for `pointsEarned` and `feedback`.
4.  Submits to:
    ```json
    POST /api/v1/exams/grade
    {
      "studentExamResultId": 123,
      "gradedAnswers": [
        {
          "studentAnswerId": 456, // ID of the specific answer record containing the image
          "pointsEarned": 5,      // Teacher assigns this
          "isCorrect": true,
          "feedback": "Excellent diagram!"
        }
      ]
    }
    ```

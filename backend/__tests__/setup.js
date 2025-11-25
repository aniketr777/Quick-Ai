// __tests__/setup.js
// Mock environment variables
process.env.GEMINI_API_KEY = 'test-gemini-key';
process.env.CLIPDROP_API = 'test-clipdrop-key';
process.env.DATABASE_URL = 'test-database-url';

// Mock Clerk
export const mockClerkClient = {
  users: {
    getUser: jest.fn().mockResolvedValue({
      id: 'user_test123',
      firstName: 'Test',
      lastName: 'User',
      username: 'testuser',
      imageUrl: 'https://example.com/image.jpg',
      privateMetadata: {
        plan: 'free',
        free_usage: 0,
      },
    }),
    updateUser: jest.fn().mockResolvedValue({}),
  },
};

// Mock database
export const mockSql = jest.fn();
mockSql.array = jest.fn((arr) => arr);

// Mock Cloudinary
export const mockCloudinary = {
  uploader: {
    upload: jest.fn().mockResolvedValue({
      secure_url: 'https://cloudinary.com/test-image.jpg',
      public_id: 'test-public-id',
    }),
  },
  url: jest.fn().mockReturnValue('https://cloudinary.com/transformed-image.jpg'),
};

// Mock Google AI
export const mockGenerativeAI = {
  getGenerativeModel: jest.fn().mockReturnValue({
    generateContent: jest.fn().mockResolvedValue({
      response: {
        text: jest.fn().mockReturnValue('Generated content'),
        candidates: [
          {
            content: {
              parts: [{ text: 'Generated content' }],
            },
          },
        ],
      },
    }),
  }),
};

// Mock axios
export const mockAxios = {
  post: jest.fn().mockResolvedValue({
    data: Buffer.from('fake-image-data'),
  }),
};

// Mock FormData
export const mockFormData = jest.fn().mockImplementation(() => ({
  append: jest.fn(),
  getHeaders: jest.fn().mockReturnValue({}),
}));

// Mock pdf-parse
export const mockPdfParse = jest.fn().mockResolvedValue({
  text: 'Sample resume text content',
});

// Mock fs
export const mockFs = {
  readFileSync: jest.fn().mockReturnValue(Buffer.from('fake-pdf-data')),
};

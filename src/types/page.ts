// Formato do Page do Spring com spring.data.web.pageable.serialization-mode=via_dto.
export type Page<T> = {
  content: T[];
  page: {
    size: number;
    number: number;
    totalElements: number;
    totalPages: number;
  };
};

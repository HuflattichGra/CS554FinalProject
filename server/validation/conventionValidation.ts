import dayjs from 'dayjs';

export function validateConventionFields(body: any) {
  const errors: string[] = [];

  if (!body.name || typeof body.name !== 'string') {
    errors.push('Name is required and must be a string');
  } else if (body.name.trim().length > 30) {
    errors.push('Name cannot exceed 30 characters');
  }

  if (body.tags !== undefined) {
    if (!Array.isArray(body.tags)) {
      errors.push('Tags must be an array');
    } else if (body.tags.length > 10) {
      errors.push('Tags cannot exceed 10 items');
    }
  }

  if (!body.startDate || !dayjs(body.startDate).isValid()) {
    errors.push('startDate is required and must be a valid date');
  } else {
    const start = dayjs(body.startDate);
    const today = dayjs();
    if (start.isBefore(today, 'day')) {
      errors.push('startDate cannot be in the past');
    }
    if (start.isAfter(today.add(100, 'year'))) {
      errors.push('startDate must be within 100 years');
    }
  }

  if (!body.endDate || !dayjs(body.endDate).isValid()) {
    errors.push('endDate is required and must be a valid date');
  } else if (body.startDate && dayjs(body.startDate).isValid()) {
    const start = dayjs(body.startDate);
    const end = dayjs(body.endDate);
    if (end.isBefore(start, 'day')) {
      errors.push('endDate must be the same as or after startDate');
    }
    if (end.isAfter(start.add(100, 'year'))) {
      errors.push('endDate must be within 100 years from startDate');
    }
  }

  if (!body.description || typeof body.description !== 'string') {
    errors.push('Description is required and must be a string');
  } else if (body.description.trim().length < 10 || body.description.trim().length > 100) {
    errors.push('Description must be between 10 and 100 characters');
  }

  return errors;
}

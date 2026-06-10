import type {
  CreateUserFormState,
  MintikaOptionDto,
  UserDto,
  UserTypeOptionDto,
} from '../types/user.types'

function resolveUserTypeId(
  user: UserDto,
  userTypes: UserTypeOptionDto[] | undefined,
): string {
  if (user.userTypeId != null) return String(user.userTypeId)
  const match = userTypes?.find((item) => item.description === user.userTypeDescription)
  return match ? String(match.id) : ''
}

function resolveMintikaId(
  user: UserDto,
  mintikas: MintikaOptionDto[] | undefined,
): string {
  if (user.mintikaId != null) return String(user.mintikaId)
  const match = mintikas?.find((item) => item.adi === user.mintikaAdi)
  return match ? String(match.id) : ''
}

export function mapUserToFormState(
  user: UserDto,
  options?: {
    userTypes?: UserTypeOptionDto[]
    mintikas?: MintikaOptionDto[]
  },
): CreateUserFormState {
  return {
    userName: user.userName,
    fullName: user.fullName,
    password: '',
    insuranceNumber: user.insuranceNumber ?? '',
    userTypeId: resolveUserTypeId(user, options?.userTypes),
    admin: user.admin,
    aktif: user.aktif,
    lokasyon: user.lokasyon ?? '',
    departmanAdi: user.departmanAdi ?? '',
    supervisorUserId: user.supervisorUserId != null ? String(user.supervisorUserId) : '',
    mintikaId: resolveMintikaId(user, options?.mintikas),
    uretimMerkeziYetki: user.uretimMerkeziYetki,
    email: user.email ?? '',
    tel: user.tel ?? '',
    icraOdemeUyari: user.icraOdemeUyari,
  }
}

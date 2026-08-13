namespace AgileEstimation.Domain.Enums;
public enum UserRole
{
    Moderator = 1,

    Developer = 2,

    // Renamed from ScrumMaster. Kept the value at 3 deliberately — Role
    // is persisted as a plain int (see UserConfiguration.HasConversion<int>()),
    // so this rename needs no data migration; existing rows with Role=3
    // become Tester automatically.
    Tester = 3
}
